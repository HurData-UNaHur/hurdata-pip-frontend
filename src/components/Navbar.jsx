
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

import logoUnahur from '../assets/unahur.jpeg';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.activeLink}` : styles.link
          }
        >
          General
        </NavLink>
        <NavLink
          to="/materias"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.activeLink}` : styles.link
          }
        >
          Materias
        </NavLink>
        <NavLink
          to="/predicciones"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.activeLink}` : styles.link
          }
        >
          Predicciones
        </NavLink>
        {/* Logo posicionado a la derecha */}
        <div className={styles.logoContainer}>
          <img src={logoUnahur} alt="Logo UNaHur" className={styles.logo} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;