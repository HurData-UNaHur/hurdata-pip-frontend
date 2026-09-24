
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Predicciones from './pages/Predicciones';

function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Barra superior de navegación */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materias" element={<Materias />} />
          <Route path="/predicciones" element={<Predicciones />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;