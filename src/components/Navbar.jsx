
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import logoUnahur from '../assets/unahur.jpeg';
import UploadModal from './UploadModal';

function Navbar({ theme, toggleTheme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadSuccess = () => {
    // Recarga la página para refrescar los datos traídos desde el backend
    window.location.reload();
  };

  return (
    <>
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
        </div>

        {/* Acciones a la derecha: Carga de SIU + Toggle de Tema + Logo */}
        <div className={styles.rightActions}>
          <button 
            className={styles.themeToggleBtn} 
            onClick={() => setIsModalOpen(true)} 
            title="Cargar archivo SIU (.xlsx)"
          >
            📁 Cargar SIU
          </button>
          <button 
            className={styles.themeToggleBtn} 
            onClick={toggleTheme} 
            title="Cambiar Tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className={styles.logoContainer}>
            <img src={logoUnahur} alt="UNaHur" className={styles.logo} />
          </div>
        </div>
      </nav>

      {/* Modal de carga montado de forma independiente */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleUploadSuccess} 
      />
    </>
  );
}

export default Navbar;