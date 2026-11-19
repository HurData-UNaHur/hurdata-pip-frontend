import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import logoUnahur from '../assets/unahur.jpeg';
import { PERMISOS, tienePermiso } from '../services/api';

function Navbar({ theme, toggleTheme, usuario, onLogout }) {
  // Usuario con login real (no invitado)
  const esAutorizado = Boolean(usuario) && usuario.role !== 'invitado';
  // Página Cargas (subir, historial, borrar): Admin y Directivo (todas), Docente (las suyas)
  const puedeVerCargas = tienePermiso(usuario, PERMISOS.VER_CARGAS);

  return (
    <>
      <nav className={styles.navbar}>
        {/* Espaciador izquierdo para mantener los enlaces centrados en escritorio */}
        <div className={styles.leftSpacer} />

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
          {puedeVerCargas && (
            <NavLink
              to="/cargas"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.activeLink}` : styles.link
              }
            >
              Cargas
            </NavLink>
          )}
        </div>

        {/* Acciones a la derecha: Usuario + Toggle de Tema + Salir + Logo (la carga de Excel está en /cargas) */}
        <div className={styles.rightActions}>
          {usuario && (
            <span className={styles.userBadge} title={usuario.cargo}>
              {esAutorizado ? '🎓' : '👤'} {usuario.nombre}
            </span>
          )}

          <button 
            className={styles.themeToggleBtn} 
            onClick={toggleTheme} 
            title="Cambiar Tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {onLogout && (
            <button
              className={styles.logoutBtn}
              onClick={onLogout}
              title="Cerrar Sesión"
            >
              Salir
            </button>
          )}

          <div className={styles.logoContainer}>
            <img src={logoUnahur} alt="UNaHur" className={styles.logo} />
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;