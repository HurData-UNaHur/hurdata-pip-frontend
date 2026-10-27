
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';

function App() {
  // Estado elevado para persistir la selección de materia entre navegaciones
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('ingles');

  // Estado para el Modo Claro / Modo Oscuro con lectura inicial desde localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Efecto para aplicar el atributo data-theme en el HTML y guardar la preferencia
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Función alternadora entre tema claro y oscuro
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      {/* Pasamos la función y el estado del tema como props a la barra superior */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Contenedor principal de las vistas de la aplicación */}
      <main style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materias" element={<Materias />} />
          <Route
            path="/predicciones"
            element={
              <Predicciones
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