import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';
import { transformarDatosBackend } from './utils/transformData';

const API_URL = 'http://localhost:8000';

const PERIODOS_MOCK_FALLBACK = [
  { id_periodo: 'mock1', label: '2022 - PRIMER CUATRIMESTRE' },
  { id_periodo: 'mock2', label: '2022 - SEGUNDO CUATRIMESTRE' },
];

const CARRERAS_MOCK_FALLBACK = [
  { id: '1', nombre: 'Licenciatura en Informática' },
];

function App() {
  const [resetKey, setResetKey]                       = useState(0);
  const [theme, setTheme]                             = useState(() => localStorage.getItem('theme') || 'light');
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
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('ingles');

  // ── Tema ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // ── Carga inicial de períodos ─────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    fetch(`${API_URL}/api/periodos`)
      .then((res) => {
        if (!res.ok) throw new Error('sin respuesta');
        return res.json();
      })
      .then((data) => {
        if (cancelado) return;
        if (data?.periodos?.length > 0) {
          setListaPeriodos(data.periodos);
          setPeriodoSeleccionado(data.periodos[0].label);
        } else {
          setListaPeriodos(PERIODOS_MOCK_FALLBACK);
          setPeriodoSeleccionado(PERIODOS_MOCK_FALLBACK[0].label);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setListaPeriodos(PERIODOS_MOCK_FALLBACK);
          setPeriodoSeleccionado(PERIODOS_MOCK_FALLBACK[0].label);
        }
      });

    return () => { cancelado = true; };
  }, []);

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
          setListaCarreras(CARRERAS_MOCK_FALLBACK);
          setCarreraSeleccionada(CARRERAS_MOCK_FALLBACK[0].nombre);
          localStorage.setItem('hurdata_carrera_activa', CARRERAS_MOCK_FALLBACK[0].nombre);
        }
      })
      .catch(() => {
        setListaCarreras(CARRERAS_MOCK_FALLBACK);
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
      .catch(() => limpiarDatosLocales());
  }, [periodoSeleccionado, carreraSeleccionada]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers de datos ─────────────────────────────────────────────────────
  const limpiarDatosLocales = () => {
    setDataDashboard({});
    setListaMateriasExcel([]);
    localStorage.removeItem('hurdata_dashboard');
    localStorage.removeItem('hurdata_materias');
    localStorage.removeItem('hurdata_carrera_activa');
    setMateriaSeleccionada('ingles');
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

  const handleCambiarCarrera = (nuevaCarrera) => {
    setCarreraSeleccionada(nuevaCarrera);
    localStorage.setItem('hurdata_carrera_activa', nuevaCarrera);
  };

  // ── Upload Excel ──────────────────────────────────────────────────────────
  const handleUploadSuccess = async (dataBackend) => {
    try {
      const resPeriodos = await fetch(`${API_URL}/api/periodos`);
      if (resPeriodos.ok) {
        const dataP = await resPeriodos.json();
        if (dataP?.periodos?.length > 0) {
          setListaPeriodos(dataP.periodos);
          const periodoSubido = dataBackend?.resumen?.periodo || dataBackend?.periodo;
          const periodoActivo = periodoSubido || dataP.periodos[0].label;
          setPeriodoSeleccionado(periodoActivo);

          const resCarreras = await fetch(`${API_URL}/api/carreras?periodo=${encodeURIComponent(periodoActivo)}`);
          if (resCarreras.ok) {
            const dataC = await resCarreras.json();
            if (dataC?.carreras?.length > 0) setListaCarreras(dataC.carreras);
          }
        }
      }

      const carreraSubida = dataBackend?.resumen?.nombre_carrera || dataBackend?.nombre_carrera;
      if (carreraSubida) {
        setCarreraSeleccionada(carreraSubida);
        localStorage.setItem('hurdata_carrera_activa', carreraSubida);
      }

      actualizarDatosLocales(dataBackend);
    } catch (err) {
      console.error('Error actualizando tras upload:', err);
    }
  };

  // ── Reset DB ──────────────────────────────────────────────────────────────
  const handleResetSuccess = async () => {
    // 1. Limpiar estado local y localStorage de inmediato
    localStorage.clear();
    localStorage.setItem('theme', theme); // preservar el tema
    limpiarDatosLocales();

    // 2. Consultar el backend para obtener el estado post-reset
    let periodosFinal   = PERIODOS_MOCK_FALLBACK;
    let periodoFinal    = PERIODOS_MOCK_FALLBACK[0].label;
    let carrerasFinal   = CARRERAS_MOCK_FALLBACK;
    let carreraFinal    = CARRERAS_MOCK_FALLBACK[0].nombre;

    try {
      const res = await fetch(`${API_URL}/api/periodos`);
      if (res.ok) {
        const data = await res.json();
        if (data?.periodos?.length > 0) {
          periodosFinal = data.periodos;
          periodoFinal  = data.periodos[0].label;
        }
      }
    } catch (_) { /* sin conexión, usa mock */ }

    try {
      const res = await fetch(`${API_URL}/api/carreras?periodo=${encodeURIComponent(periodoFinal)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.carreras?.length > 0) {
          carrerasFinal = data.carreras;
          carreraFinal  = data.carreras[0].nombre;
        }
      }
    } catch (_) { /* sin conexión, usa mock */ }

    // 3. Setear el nuevo estado limpio
    setListaPeriodos(periodosFinal);
    setListaCarreras(carrerasFinal);
    setCarreraSeleccionada(carreraFinal);
    localStorage.setItem('hurdata_carrera_activa', carreraFinal);

    // 4. Setear el período dispara el useEffect de datos, que limpiará el dashboard
    setPeriodoSeleccionado(periodoFinal);

    // 5. Remount de las vistas para limpiar estados internos (useState locales)
    setResetKey((k) => k + 1);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <BrowserRouter key={resetKey}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onUploadSuccess={handleUploadSuccess}
        onResetSuccess={handleResetSuccess}
      />

      <main style={{ padding: '24px' }}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
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
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
