
import { Link } from 'react-router-dom';

// Importamos los estilos encapsulados del Navbar

import styles from './Navbar.module.css';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navLink}>
        General
      </Link>
      <Link to="/materias" className={styles.navLink}>
         Materias
      </Link>
      <Link to="/predicciones" className={styles.navLink}>
         Predicciones
      </Link>
    </nav>
  );
}

// Que hacemos?? Le agregamos un icono o algo a los nombres?

export default Navbar;
