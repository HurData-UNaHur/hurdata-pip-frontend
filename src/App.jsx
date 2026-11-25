import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import ToastProvider from './components/ToastProvider';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';
import Cargas from './pages/Cargas';
import Cuenta from './pages/Cuenta';
import Accesos from './pages/Accesos';
import EstadoVacio from './components/EstadoVacio';
// Evolución usa Recharts (pesado): se descarga recién cuando alguien entra a la página
const Evolucion = lazy(() => import('./pages/Evolucion'));
import Login from './pages/Login';
import { transformarDatosBackend } from './utils/transformData';
import { esTokenVigente, PERMISOS, tienePermiso } from './services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Roles con sesión real (login contra el backend). El invitado no se persiste.
// Una sesión vieja con role 'autorizado' no se restaura: hay que volver a loguearse.
const ROLES_CON_SESION = ['admin', 'directivo', 'docente', 'no_docente'];
const tieneSesionPersistente = (u) => ROLES_CON_SESION.includes(u?.role);

function App() {
  const [resetKey, setResetKey] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('hurdata_usuario');
    if (!saved) return null;
    let parsed = null;
    try { parsed = JSON.parse(saved); } catch { /* dato corrupto */ }
    // Solo restaurar usuarios con login real y con el JWT todavía vigente.
    // Si el token expiró (8 h) o falta, se limpia la sesión y vuelve al Login.
    if (tieneSesionPersistente(parsed) && esTokenVigente(localStorage.getItem('hurdata_token'))) {
      return parsed;
    }
    localStorage.removeItem('hurdata_usuario');
    localStorage.removeItem('hurdata_token');
    return null;
  });
  const [listaPeriodos, setListaPeriodos]             = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [listaCarreras, setListaCarreras]             = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(() => localStorage.getItem('hurdata_carrera_activa') || '');
  const [dataDashboard, setDataDashboard]             = useState(() => {
    const saved = localStorage.getItem('hurdata_dashboard');
    return saved ? JSON.parse(saved) : {};
  });
  const [listaMateriasExcel, setListaMateriasExcel]   = useState(() => {
    const saved = localStorage.getItem('hurdata_materias');
    return saved ? JSON.parse(saved) : [];
  });
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  // Conexión con el backend: 'cargando' | 'ok' | 'error' (separa "backend caído" de "no hay datos")
  const [estadoConexion, setEstadoConexion] = useState('cargando');
  const [intentoCarga, setIntentoCarga] = useState(0);

  // ── Sesión de Usuario ─────────────────────────────────────────────────────
  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
    if (tieneSesionPersistente(datosUsuario)) {
      localStorage.setItem('hurdata_usuario', JSON.stringify(datosUsuario));
    } else {
      localStorage.removeItem('hurdata_usuario');
    }
  };

  const handleLogout = () => {
    // El Login no cambia la dirección por sí solo: se deja en la raíz para que la próxima persona
    // entre por el Inicio y no por la sección donde estaba la anterior
    window.history.replaceState(null, '', '/');
    setUsuario(null);
    localStorage.removeItem('hurdata_usuario');
    localStorage.removeItem('hurdata_token');
  };

  // ── Helpers de datos (Declarados arriba para evitar errores de TDZ / hoisting) ──
  const limpiarDatosLocales = () => {
    setDataDashboard({});
    setListaMateriasExcel([]);
    localStorage.removeItem('hurdata_dashboard');
    localStorage.removeItem('hurdata_materias');
    localStorage.removeItem('hurdata_carrera_activa');
    setMateriaSeleccionada('');
  };

  // Sin períodos en la DB: no hay nada que mostrar (ni datos cacheados en localStorage)
  const quedarSinDatos = () => {
    setListaPeriodos([]);
    setPeriodoSeleccionado('');
    setListaCarreras([]);
    setCarreraSeleccionada('');
    limpiarDatosLocales();
  };

  const actualizarDatosLocales = (dataBackend) => {
    if (!dataBackend) { limpiarDatosLocales(); return; }

    const contenido = dataBackend.resumen || dataBackend.data || dataBackend;
    const { dataDashboard: dashData, listaMaterias: matData } = transformarDatosBackend(contenido);

    if (matData?.length > 0) {
      setDataDashboard(dashData);
      setListaMateriasExcel(matData);
      localStorage.setItem('hurdata_dashboard', JSON.stringify(dashData));
      localStorage.setItem('hurdata_materias', JSON.stringify(matData));
      setMateriaSeleccionada(matData[0].id);
    } else {
      limpiarDatosLocales();
    }
  };

  // ── Tema ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // ── Carga inicial de períodos ─────────────────────────────────────────────
  // Se repite al tocar "Reintentar" (intentoCarga cambia).
  useEffect(() => {
    let cancelado = false;

    fetch(`${API_URL}/api/periodos`)
      .then((res) => {
        if (!res.ok) throw new Error('sin respuesta');
        return res.json();
      })
      .then((data) => {
        if (cancelado) return;
        setEstadoConexion('ok');
        if (data?.periodos?.length > 0) {
          setListaPeriodos(data.periodos);
          setPeriodoSeleccionado(data.periodos[0].label);
        } else {
          quedarSinDatos();
        }
      })
      .catch(() => {
        if (cancelado) return;
        // Backend caído: no es lo mismo que "no hay datos"
        quedarSinDatos();
        setEstadoConexion('error');
      });

    return () => { cancelado = true; };
  }, [intentoCarga]); // eslint-disable-line react-hooks/exhaustive-deps

  const reintentarConexion = () => {
    setEstadoConexion('cargando');
    setIntentoCarga((n) => n + 1);
  };

  // Lo que ven las páginas: 'cargando' | 'error' | 'vacio' (sin datos en la DB) | 'ok'
  const estadoDatos = estadoConexion !== 'ok'
    ? estadoConexion
    : (listaPeriodos.length > 0 ? 'ok' : 'vacio');
  const puedeCargar = tienePermiso(usuario, PERMISOS.CARGAR);

  // ── Carreras al cambiar período ───────────────────────────────────────────
  useEffect(() => {
    if (!periodoSeleccionado) return;

    fetch(`${API_URL}/api/carreras?periodo=${encodeURIComponent(periodoSeleccionado)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error carreras');
        return res.json();
      })
      .then((data) => {
        if (data?.carreras?.length > 0) {
          setListaCarreras(data.carreras);
          const nombres = data.carreras.map((c) => c.nombre);
          if (!carreraSeleccionada || !nombres.includes(carreraSeleccionada)) {
            const primera = data.carreras[0].nombre;
            setCarreraSeleccionada(primera);
            localStorage.setItem('hurdata_carrera_activa', primera);
          }
        } else {
          setListaCarreras([]);
          setCarreraSeleccionada('');
          localStorage.removeItem('hurdata_carrera_activa');
        }
      })
      .catch(() => {
        setListaCarreras([]);
        setCarreraSeleccionada('');
        localStorage.removeItem('hurdata_carrera_activa');
        setEstadoConexion('error');
      });
  }, [periodoSeleccionado]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Datos del dashboard al cambiar período o carrera ─────────────────────
  useEffect(() => {
    if (!periodoSeleccionado) return;

    const url = `${API_URL}/api/datos?periodo=${encodeURIComponent(periodoSeleccionado)}` +
      (carreraSeleccionada ? `&carrera=${encodeURIComponent(carreraSeleccionada)}` : '');

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Error datos');
        return res.json();
      })
      .then((data) => actualizarDatosLocales(data))
      .catch(() => {
        limpiarDatosLocales();
        setEstadoConexion('error');
      });
  }, [periodoSeleccionado, carreraSeleccionada]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCambiarCarrera = (nuevaCarrera) => {
    setCarreraSeleccionada(nuevaCarrera);
    localStorage.setItem('hurdata_carrera_activa', nuevaCarrera);
  };

  // ── Upload Excel ──────────────────────────────────────────────────────────
  const handleUploadSuccess = async (dataBackend) => {
    try {
      // 1. Refrescar lista de períodos
      const resPeriodos = await fetch(`${API_URL}/api/periodos`);
      if (!resPeriodos.ok) throw new Error('Error al traer períodos');
      const dataP = await resPeriodos.json();

      const periodoSubido = dataBackend?.resumen?.periodo || dataBackend?.periodo;
      const periodoActivo = periodoSubido || (dataP?.periodos?.[0]?.label ?? periodoSeleccionado);

      if (dataP?.periodos?.length > 0) setListaPeriodos(dataP.periodos);
      setEstadoConexion('ok'); // la subida demuestra que el backend responde

      // 2. Refrescar carreras del período subido
      const resCarreras = await fetch(`${API_URL}/api/carreras?periodo=${encodeURIComponent(periodoActivo)}`);
      if (resCarreras.ok) {
        const dataC = await resCarreras.json();
        if (dataC?.carreras?.length > 0) setListaCarreras(dataC.carreras);
      }

      // 3. Setear carrera activa
      const carreraSubida = dataBackend?.resumen?.nombre_carrera || dataBackend?.nombre_carrera;
      const carreraActiva = carreraSubida || carreraSeleccionada;
      if (carreraSubida) {
        setCarreraSeleccionada(carreraSubida);
        localStorage.setItem('hurdata_carrera_activa', carreraSubida);
      }

      // 4. Traer los datos reales del dashboard desde /api/datos (no del resumen del upload)
      const url = `${API_URL}/api/datos?periodo=${encodeURIComponent(periodoActivo)}&carrera=${encodeURIComponent(carreraActiva)}`;
      const resDatos = await fetch(url);
      if (!resDatos.ok) throw new Error('Error al traer datos');
      const dataDatos = await resDatos.json();

      // 5. Actualizar estado — si el período cambió, setearlo dispara el useEffect;
      //    si es el mismo período, actualizamos manualmente con los datos frescos
      if (periodoActivo !== periodoSeleccionado) {
        setPeriodoSeleccionado(periodoActivo);
      }
      actualizarDatosLocales(dataDatos);

    } catch (err) {
      console.error('Error actualizando tras upload:', err);
    }
  };

  // ── Reset DB ──────────────────────────────────────────────────────────────
  const handleResetSuccess = async () => {
    // 1. Limpiar estado local y localStorage de inmediato
    const tokenActual = localStorage.getItem('hurdata_token');
    localStorage.clear();
    localStorage.setItem('theme', theme); // preservar el tema
    if (tieneSesionPersistente(usuario)) {
      if (tokenActual) localStorage.setItem('hurdata_token', tokenActual); // preservar el JWT
      localStorage.setItem('hurdata_usuario', JSON.stringify(usuario)); // preservar la sesión activa solo si es autorizado
    }
    limpiarDatosLocales();

    // 2. Consultar el backend para obtener el estado post-reset
    let periodosFinal   = [];
    let periodoFinal    = '';
    let carrerasFinal   = [];
    let carreraFinal    = '';

    try {
      const res = await fetch(`${API_URL}/api/periodos`);
      if (!res.ok) throw new Error('sin respuesta');
      const data = await res.json();
      if (data?.periodos?.length > 0) {
        periodosFinal = data.periodos;
        periodoFinal  = data.periodos[0].label;
      }
      setEstadoConexion('ok');
    } catch {
      setEstadoConexion('error'); // sin conexión: se muestra el error con "Reintentar"
    }

    if (periodoFinal) try {
      const res = await fetch(`${API_URL}/api/carreras?periodo=${encodeURIComponent(periodoFinal)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.carreras?.length > 0) {
          carrerasFinal = data.carreras;
          carreraFinal  = data.carreras[0].nombre;
        }
      }
    } catch { /* sin conexión: queda vacío */ }

    // 3. Setear el nuevo estado limpio
    setListaPeriodos(periodosFinal);
    setListaCarreras(carrerasFinal);
    setCarreraSeleccionada(carreraFinal);
    if (carreraFinal) localStorage.setItem('hurdata_carrera_activa', carreraFinal);

    // 4. Forzar el cambio de estado del período (vaciándolo primero para asegurar que re-dispare los useEffect de datos)
    setPeriodoSeleccionado('');
    setResetKey((k) => k + 1);

    setTimeout(() => {
      setPeriodoSeleccionado(periodoFinal);
    }, 10);
  };

  // ── Render condicional: Si no hay usuario logueado, mostrar Login ─────────
  if (!usuario) {
    return (
      <Login
        theme={theme}
        toggleTheme={toggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // El proveedor de avisos va por fuera del router: al resetear la base la app se vuelve a montar
    // (resetKey) y el aviso de "se borraron los datos" no tiene que perderse en ese momento.
    <ToastProvider>
    <BrowserRouter key={resetKey}>
      <AppShell
        theme={theme}
        toggleTheme={toggleTheme}
        usuario={usuario}
        onLogout={handleLogout}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                estadoDatos={estadoDatos}
                puedeCargar={puedeCargar}
                onReintentar={reintentarConexion}
                mostrarOrigen={tieneSesionPersistente(usuario)}
                dataExcel={dataDashboard}
                listaMateriasExcel={listaMateriasExcel}
                periodo={periodoSeleccionado}
                setPeriodo={setPeriodoSeleccionado}
                listaPeriodos={listaPeriodos}
                carrera={carreraSeleccionada}
                setCarrera={handleCambiarCarrera}
                listaCarreras={listaCarreras}
              />
            }
          />
          <Route
            path="/materias"
            element={
              <Materias
                estadoDatos={estadoDatos}
                puedeCargar={puedeCargar}
                onReintentar={reintentarConexion}
                listaMateriasExcel={listaMateriasExcel}
                periodo={periodoSeleccionado}
                setPeriodo={setPeriodoSeleccionado}
                listaPeriodos={listaPeriodos}
                carrera={carreraSeleccionada}
                setCarrera={handleCambiarCarrera}
                listaCarreras={listaCarreras}
              />
            }
          />
          <Route
            path="/predicciones"
            element={
              <Predicciones
                estadoDatos={estadoDatos}
                puedeCargar={puedeCargar}
                onReintentar={reintentarConexion}
                listaMateriasExcel={listaMateriasExcel}
                materiaSeleccionada={materiaSeleccionada}
                setMateriaSeleccionada={setMateriaSeleccionada}
                periodo={periodoSeleccionado}
                setPeriodo={setPeriodoSeleccionado}
                listaPeriodos={listaPeriodos}
                carrera={carreraSeleccionada}
                setCarrera={handleCambiarCarrera}
                listaCarreras={listaCarreras}
              />
            }
          />
          <Route
            path="/evolucion"
            element={
              <Suspense fallback={<EstadoVacio estado="cargando" />}>
                <Evolucion
                  estadoDatos={estadoDatos}
                  puedeCargar={puedeCargar}
                  onReintentar={reintentarConexion}
                  carreraInicial={carreraSeleccionada}
                  theme={theme}
                />
              </Suspense>
            }
          />
          <Route path="/cuenta" element={<Cuenta />} />
          {tienePermiso(usuario, PERMISOS.APROBAR_REGISTROS) && (
            <Route path="/accesos" element={<Accesos usuario={usuario} />} />
          )}
          {tienePermiso(usuario, PERMISOS.VER_CARGAS) && (
            <Route
              path="/cargas"
              element={
                <Cargas
                  usuario={usuario}
                  onUploadSuccess={handleUploadSuccess}
                  onDatosBorrados={handleResetSuccess}
                />
              }
            />
          )}
          {/* Una dirección que no existe para este rol (por ejemplo /accesos para un No Docente que entra después
              de otra persona) vuelve al inicio, en lugar de dejar la pantalla en blanco */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;