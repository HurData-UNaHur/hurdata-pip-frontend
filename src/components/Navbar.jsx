import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import logoUnahur from '../assets/unahur.jpeg';
import UploadModal from './UploadModal';
import { PERMISOS, tienePermiso } from '../services/api';

function Navbar({ theme, toggleTheme, onUploadSuccess, onResetSuccess, usuario, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Usuario con login real (no invitado)
  const esAutorizado = Boolean(usuario) && usuario.role !== 'invitado';
  // Subir Excel requiere el permiso datos:cargar (el backend lo valida en /upload)
  const puedeCargar = tienePermiso(usuario, PERMISOS.CARGAR);

  const handleUploadSuccess = (dataBackend) => {
    // 1. Pasa los datos recibidos del backend al manejador global en App.jsx
    if (onUploadSuccess) {
      onUploadSuccess(dataBackend);
    }
    // 2. Cierra el modal sin recargar la página (window.location.reload eliminado)
    setIsModalOpen(false);
  };

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
        </div>

        {/* Acciones a la derecha: Usuario + Carga de SIU (solo autorizados) + Toggle de Tema + Salir + Logo */}
        <div className={styles.rightActions}>
          {usuario && (
            <span className={styles.userBadge} title={usuario.cargo}>
              {esAutorizado ? '🎓' : '👤'} {usuario.nombre}
            </span>
          )}

          {puedeCargar && (
            <button 
              className={styles.themeToggleBtn} 
              onClick={() => setIsModalOpen(true)} 
              title="Cargar o gestionar archivos SIU (.xlsx)"
            >
              📁 
            </button>
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

      {/* Modal de carga montado solo para usuarios que pueden cargar */}
      {puedeCargar && (
        <UploadModal 
          usuario={usuario}
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleUploadSuccess}
          onResetSuccess={onResetSuccess}
        />
      )}
    </>
  );
}

export default Navbar;