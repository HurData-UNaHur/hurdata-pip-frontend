import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';
import { transformarDatosBackend } from './utils/transformData';

// Períodos Mock de respaldo si la base de datos está vacía
const PERIODOS_MOCK_FALLBACK = [
  { id_periodo: 'mock1', label: '2022 - PRIMER CUATRIMESTRE' },
  { id_periodo: 'mock2', label: '2022 - SEGUNDO CUATRIMESTRE' }
];

function App() {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('ingles');
  const [listaPeriodos, setListaPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

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

  // 1. CARGA INICIAL DE PERÍODOS (Evalúa si la DB tiene datos reales o aplica Mock)
  useEffect(() => {
    let cancelado = false;

    const cargarInicial = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/periodos');
        if (!res.ok) throw new Error('Servidor sin respuesta');
        const data = await res.json();

        if (!cancelado) {
          if (data && Array.isArray(data.periodos) && data.periodos.length > 0) {
            // DB CON DATOS REALES: Usar únicamente los períodos subidos desde los Excels
            setListaPeriodos(data.periodos);
            setPeriodoSeleccionado(data.periodos[0].label);
          } else {
            // DB VACÍA: Cargar Mock de respaldo
            setListaPeriodos(PERIODOS_MOCK_FALLBACK);
            setPeriodoSeleccionado(PERIODOS_MOCK_FALLBACK[0].label);
          }
        }
      } catch (error) {
        console.warn('Servidor offline o sin datos en SQLite, activando Mock de respaldo:', error);
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

  // Limpieza local
  const limpiarDatosLocales = () => {
    setDataDashboard({});
    setListaMateriasExcel([]);
    localStorage.removeItem('hurdata_dashboard');
    localStorage.removeItem('hurdata_materias');
    setMateriaSeleccionada('ingles');
  };

  // Procesador de datos
  const actualizarDatosLocales = (dataBackend) => {
    if (!dataBackend) {
      limpiarDatosLocales();
      return;
    }

    const contenido = dataBackend.resumen || dataBackend.data || dataBackend;
    const { dataDashboard: dashData, listaMaterias: matData } = transformarDatosBackend(contenido);

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

  // 2. CARGA DE DATOS AL CAMBIAR EL PERÍODO SELECCIONADO
  useEffect(() => {
    if (!periodoSeleccionado) return;

    fetch(`http://localhost:8000/api/datos?periodo=${encodeURIComponent(periodoSeleccionado)}`)
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
  }, [periodoSeleccionado]);

  // 3. CALLBACK TRAS SUBIR UN ARCHIVO EN EL MODAL (Navbar)
  const handleUploadSuccess = async (dataBackend) => {
    try {
      // Reconsultamos la API para refrescar la lista de períodos
      const res = await fetch('http://localhost:8000/api/periodos');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.periodos) && data.periodos.length > 0) {
          setListaPeriodos(data.periodos);

          const periodoSubido = dataBackend?.resumen?.periodo || dataBackend?.periodo || dataBackend?.label;
          if (periodoSubido) {
            setPeriodoSeleccionado(periodoSubido);
          } else {
            setPeriodoSeleccionado(data.periodos[0].label);
          }
        }
      }
      actualizarDatosLocales(dataBackend);
    } catch (error) {
      console.error('Error actualizando tras upload:', error);
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
              />
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;