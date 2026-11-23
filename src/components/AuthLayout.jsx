import logoUnahur from '../assets/logo-hurlingham.png';
import IconoTema from './IconoTema';
import styles from '../pages/Login.module.css';

/*
 * Marco de las pantallas de acceso (Login, Registro, Recuperar contraseña): barra institucional,
 * identidad del sistema a la izquierda y, a la derecha, el formulario que llega como children.
 */
export default function AuthLayout({ theme, toggleTheme, children }) {
  return (
    <div className={styles.pagina}>
      {/* Barra institucional con los cuatro colores de la UNaHur */}
      <div className={styles.barra} aria-hidden="true" />

      <button
        type="button"
        className={styles.temaBtn}
        onClick={toggleTheme}
        title="Cambiar tema"
        aria-label="Cambiar tema"
      >
        <IconoTema theme={theme} />
      </button>

      <aside className={styles.identidad}>
        {/* Sin sesión, el logo recarga la página y vuelve al inicio de sesión */}
        <a href="/" className={styles.logoEnlace} aria-label="Volver al inicio de sesión">
          <img src={logoUnahur} alt="UNaHur, Universidad Nacional de Hurlingham" className={styles.logo} />
        </a>
        <div className={styles.titulos}>
          <p className={styles.titulo}>HurData: Dashboard Analítico de Gestión Académica</p>
          <p className={styles.subtitulo}>Universidad Nacional de Hurlingham</p>
        </div>
      </aside>

      <main className={styles.panelForm}>{children}</main>
    </div>
  );
}
