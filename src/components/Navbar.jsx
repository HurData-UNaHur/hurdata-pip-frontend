import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import logoUnahur from '../assets/unahur.jpeg';
import { GraduationCap, User } from 'lucide-react';
import { PERMISOS, tienePermiso } from '../services/api';
import IconoTema from './IconoTema';

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
          <NavLink
            to="/evolucion"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.activeLink}` : styles.link
            }
          >
            Evolución
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
              {esAutorizado
                ? <GraduationCap size={15} className="icono-inline" aria-hidden="true" />
                : <User size={15} className="icono-inline" aria-hidden="true" />}
              {usuario.nombre}
            </span>
          )}

          <button 
            className={styles.themeToggleBtn} 
            onClick={toggleTheme} 
            title="Cambiar Tema"
          >
            <IconoTema theme={theme} sobreVerde />
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