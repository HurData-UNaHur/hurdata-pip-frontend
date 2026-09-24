import { Link } from 'react-router-dom'; // Navegación sin recargar la pag.


function Navbar() {
  // Estilo base para los enlaces del menú.
  const linkStyle = {
    color: '#f8fafc',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
  };

  return (
    <nav
      style={{
        display: 'flex',
        gap: '20px',
        padding: '16px',
        backgroundColor: '#1e293b', // Fondito del menú
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #334155',
      }}>
    
      <Link to="/" style={linkStyle}>
            General
      </Link>
      <Link to="/materias" style={linkStyle}>
            Materias
      </Link>
      <Link to="/predicciones" style={linkStyle}>
            Predicciones
      </Link>
    </nav>
  );
}
// Que hacemos?? Le agregamos un icono o algo a los nombres?
export default Navbar;