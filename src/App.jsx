
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';

function App() {
  // Estado elevado para persistir la selección entre navegaciones
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('ingles');

  return (
    <BrowserRouter>
      <Navbar />
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