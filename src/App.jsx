import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';
import { transformarDatosBackend } from './utils/transformData';

const PERIODOS_MOCK_FALLBACK = [
  { id_periodo: 'mock1', label: '2022 - PRIMER CUATRIMESTRE' },
  { id_periodo: 'mock2', label: '2022 - SEGUNDO CUATRIMESTRE' }
];

const CARRERAS_MOCK_FALLBACK = [
  { id: '1', nombre: 'Licenciatura en Informática' },
];

function App() {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('ingles');
  const [listaPeriodos, setListaPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  
  // Persistir la carrera seleccionada en localStorage
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(() => {
    return localStorage.getItem('hurdata_carrera_activa') || '';
  });
  const [listaCarreras, setListaCarreras] = useState([]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [dataDashboard, setDataDashboard] = useState(() => {
    const saved = localStorage.getItem('hurdata_dashboard');
    return saved ? JSON.parse(saved) : {};
  });

  const [listaMateriasExcel, setListaMateriasExcel] = useState(() => {
    const saved = localStorage.getItem('hurdata_materias');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 1. Carga inicial de Períodos
  useEffect(() => {
    let cancelado = false;

    const cargarInicial = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/periodos');
        if (!res.ok) throw new Error('Servidor sin respuesta');
        const data = await res.json();

        if (!cancelado) {
          if (data && Array.isArray(data.periodos) && data.periodos.length > 0) {
            setListaPeriodos(data.periodos);
            setPeriodoSeleccionado(data.periodos[0].label);
          } else {
            setListaPeriodos(PERIODOS_MOCK_FALLBACK);
            setPeriodoSeleccionado(PERIODOS_MOCK_FALLBACK[0].label);
          }
        }
      } catch (error) {
        console.warn('Servidor offline o sin datos en SQLite, activando Mock:', error);
        if (!cancelado) {
          setListaPeriodos(PERIODOS_MOCK_FALLBACK);
          setPeriodoSeleccionado(PERIODOS_MOCK_FALLBACK[0].label);
        }
      }
    };

    cargarInicial();

    return () => {
      cancelado = true;
    };
  }, []);

  // 2. NUEVO: Carga independiente de la lista de Carreras al cambiar el Período
  useEffect(() => {
    if (!periodoSeleccionado) return;

    fetch(`http://localhost:8000/api/carreras?periodo=${encodeURIComponent(periodoSeleccionado)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al traer carreras');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.carreras) && data.carreras.length > 0) {
          setListaCarreras(data.carreras);

          const nombresDisponibles = data.carreras.map((c) => c.nombre);
          // Si la carrera elegida no existe en este período nuevo, seleccionamos la primera
          if (!carreraSeleccionada || !nombresDisponibles.includes(carreraSeleccionada)) {
            const nuevaCarrera = data.carreras[0].nombre;
            setCarreraSeleccionada(nuevaCarrera);
            localStorage.setItem('hurdata_carrera_activa', nuevaCarrera);
          }
        } else {
          // Si la DB está vacía o es Mock, mostramos ambas carreras de prueba
          setListaCarreras(CARRERAS_MOCK_FALLBACK);
          if (!carreraSeleccionada) {
            setCarreraSeleccionada(CARRERAS_MOCK_FALLBACK[0].nombre);
          }
        }
      })
      .catch((err) => {
        console.warn('Servidor offline o sin endpoint /api/carreras, usando fallback mock:', err);
        setListaCarreras(CARRERAS_MOCK_FALLBACK);
      });
  }, [periodoSeleccionado]);

  const limpiarDatosLocales = () => {
    setDataDashboard({});
    setListaMateriasExcel([]);
    localStorage.removeItem('hurdata_dashboard');
    localStorage.removeItem('hurdata_materias');
    localStorage.removeItem('hurdata_carrera_activa');
    setMateriaSeleccionada('ingles');
  };

  const actualizarDatosLocales = (dataBackend) => {
    if (!dataBackend) {
      limpiarDatosLocales();
      return;
    }

    const contenido = dataBackend.resumen || dataBackend.data || dataBackend;
    const { 
      dataDashboard: dashData, 
      listaMaterias: matData
    } = transformarDatosBackend(contenido);

    if (matData && matData.length > 0) {
      setDataDashboard(dashData);
      setListaMateriasExcel(matData);
      localStorage.setItem('hurdata_dashboard', JSON.stringify(dashData));
      localStorage.setItem('hurdata_materias', JSON.stringify(matData));
      setMateriaSeleccionada(matData[0].id);
    } else {
      limpiarDatosLocales();
    }
  };

  // Manejador para cambiar de carrera manualmente en la UI
  const handleCambiarCarrera = (nuevaCarrera) => {
    setCarreraSeleccionada(nuevaCarrera);
    localStorage.setItem('hurdata_carrera_activa', nuevaCarrera);
  };

  // 3. Carga de datos de la materia según Período y Carrera
  useEffect(() => {
    if (!periodoSeleccionado) return;

    let url = `http://localhost:8000/api/datos?periodo=${encodeURIComponent(periodoSeleccionado)}`;
    if (carreraSeleccionada) {
      url += `&carrera=${encodeURIComponent(carreraSeleccionada)}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => {
        actualizarDatosLocales(data);
      })
      .catch((err) => {
        console.error('Error al traer datos del período:', err);
        limpiarDatosLocales();
      });
  }, [periodoSeleccionado, carreraSeleccionada]);

  // 4. Callback tras subir un Excel (actualización instantánea sin recargar la página)
  const handleUploadSuccess = async (dataBackend) => {
    try {
      // 1. Reconsultamos la lista de períodos
      const resPeriodos = await fetch('http://localhost:8000/api/periodos');
      let periodoActivo = periodoSeleccionado;

      if (resPeriodos.ok) {
        const dataP = await resPeriodos.json();
        if (dataP && Array.isArray(dataP.periodos) && dataP.periodos.length > 0) {
          setListaPeriodos(dataP.periodos);

          const periodoSubido = dataBackend?.resumen?.periodo || dataBackend?.periodo || dataBackend?.label;
          if (periodoSubido) {
            periodoActivo = periodoSubido;
            setPeriodoSeleccionado(periodoSubido);
          } else {
            periodoActivo = dataP.periodos[0].label;
            setPeriodoSeleccionado(periodoActivo);
          }
        }
      }

      // 2. Traemos inmediatamente las carreras actualizadas en SQLite para este período
      if (periodoActivo) {
        const resCarreras = await fetch(`http://localhost:8000/api/carreras?periodo=${encodeURIComponent(periodoActivo)}`);
        if (resCarreras.ok) {
          const dataC = await resCarreras.json();
          if (dataC && Array.isArray(dataC.carreras) && dataC.carreras.length > 0) {
            setListaCarreras(dataC.carreras);
          }
        }
      }

      // 3. Fijamos la nueva carrera subida como activa
      const carreraSubida = dataBackend?.resumen?.nombre_carrera || dataBackend?.nombre_carrera;
      if (carreraSubida) {
        setCarreraSeleccionada(carreraSubida);
        localStorage.setItem('hurdata_carrera_activa', carreraSubida);
      }

      // 4. Sincronizamos tableros y materias
      actualizarDatosLocales(dataBackend);
    } catch (error) {
      console.error('Error actualizando reactivamente tras upload:', error);
    }
  };

  return (
    <BrowserRouter>
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onUploadSuccess={handleUploadSuccess}
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