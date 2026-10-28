import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';
import { transformarDatosBackend } from './utils/transformData';

function App() {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('ingles');

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

  // Resetea el almacenamiento y el estado cuando no hay datos en la DB
  const limpiarDatosLocales = () => {
    setDataDashboard({});
    setListaMateriasExcel([]);
    localStorage.removeItem('hurdata_dashboard');
    localStorage.removeItem('hurdata_materias');
    setMateriaSeleccionada('ingles');
  };

  // Función reutilizable para procesar y actualizar la información
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

  // 1. Carga automática desde FastAPI al iniciar el navegador
  useEffect(() => {
    fetch('http://localhost:8000/api/datos')
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => {
        actualizarDatosLocales(data);
      })
      .catch((err) => {
        console.error('Sin datos en SQLite o API no disponible:', err);
        // Al dar error la llamada a la DB vacía, forzamos la limpieza del localStorage
        limpiarDatosLocales();
      });
  }, []);

  // 2. Callback tras subir un nuevo Excel exitosamente
  const handleUploadSuccess = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/datos');
      if (!res.ok) throw new Error('Error al refrescar datos desde la API');
      
      const data = await res.json();
      actualizarDatosLocales(data);
    } catch (error) {
      console.error('Error al actualizar la vista tras la carga:', error);
      limpiarDatosLocales();
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
              />
            } 
          />
          <Route 
            path="/materias" 
            element={<Materias listaMateriasExcel={listaMateriasExcel} />} 
          />
          <Route
            path="/predicciones"
            element={
              <Predicciones
                listaMateriasExcel={listaMateriasExcel}
                materiaSeleccionada={materiaSeleccionada}
                setMateriaSeleccionada={setMateriaSeleccionada}
              />
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;