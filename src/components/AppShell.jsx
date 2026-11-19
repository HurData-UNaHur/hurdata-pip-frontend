import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen, Calculator, ChartLine, ChevronDown, GraduationCap, House, LogOut, Menu, Upload, User, X,
} from 'lucide-react';
import styles from './AppShell.module.css';
import logo from '../assets/logo-hurlingham.png';
import logoGris from '../assets/logo-hurlingham-grisado.png';
import IconoTema from './IconoTema';
import { PERMISOS, tienePermiso } from '../services/api';

/*
 * Marco de la aplicación: cabecera con logo y menú de usuario, barra lateral con las secciones
 * y el contenido (children) a la derecha. En pantallas chicas la barra lateral es un menú deslizable.
 */
function AppShell({ theme, toggleTheme, usuario, onLogout, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);     // barra lateral (celular)
  const [usuarioAbierto, setUsuarioAbierto] = useState(false); // menú del usuario
  const refUsuario = useRef(null);

  // Usuario con login real (no invitado)
  const esAutorizado = Boolean(usuario) && usuario.role !== 'invitado';
  const puedeVerCargas = tienePermiso(usuario, PERMISOS.VER_CARGAS);

  const secciones = [
    { to: '/', texto: 'Inicio', Icono: House, end: true },
    { to: '/materias', texto: 'Materias', Icono: BookOpen },
    { to: '/evolucion', texto: 'Evolución', Icono: ChartLine },
    { to: '/predicciones', texto: 'Predicciones', Icono: Calculator },
    ...(puedeVerCargas ? [{ to: '/cargas', texto: 'Cargas', Icono: Upload }] : []),
  ];

  // Cerrar con Escape y al hacer clic fuera del menú del usuario
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') { setMenuAbierto(false); setUsuarioAbierto(false); }
    };
    const alHacerClic = (e) => {
      if (refUsuario.current && !refUsuario.current.contains(e.target)) setUsuarioAbierto(false);
    };
    document.addEventListener('keydown', alTeclear);
    document.addEventListener('mousedown', alHacerClic);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.removeEventListener('mousedown', alHacerClic);
    };
  }, []);

  return (
    <div className={styles.shell}>
      {/* ── Cabecera ── */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.hamburguesa}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label={menuAbierto ? 'Cerrar el menú' : 'Abrir el menú'}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <div className={styles.marca}>
          <span className={styles.logoCaja}>
            <img src={logo} alt="Universidad Nacional de Hurlingham" className={styles.logoCabecera} />
          </span>
        </div>

        <div className={styles.usuario} ref={refUsuario}>
          {usuario && (
            <button
              type="button"
              className={styles.usuarioBtn}
              onClick={() => setUsuarioAbierto((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={usuarioAbierto}
              title={usuario.cargo}
            >
              <span className={styles.avatar}>
                {esAutorizado
                  ? <GraduationCap size={17} aria-hidden="true" />
                  : <User size={17} aria-hidden="true" />}
              </span>
              <span className={styles.nombre}>{usuario.nombre}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          )}
          {usuarioAbierto && (
            <div className={styles.desplegable} role="menu">
              {usuario?.cargo && <p className={styles.cargo}>{usuario.cargo}</p>}
              <button type="button" role="menuitem" className={styles.opcion} onClick={toggleTheme}>
                <IconoTema theme={theme} size={16} />
                {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
              </button>
              {onLogout && (
                <button type="button" role="menuitem" className={`${styles.opcion} ${styles.salir}`} onClick={onLogout}>
                  <LogOut size={16} aria-hidden="true" />
                  Cerrar sesión
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Barra lateral ── */}
      <aside className={`${styles.sidebar} ${menuAbierto ? styles.sidebarAbierta : ''}`} aria-label="Secciones">
        <nav className={styles.menu}>
          {secciones.map(({ to, texto, Icono, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) => (isActive ? `${styles.item} ${styles.itemActivo}` : styles.item)}
            >
              <Icono size={19} aria-hidden="true" />
              {texto}
            </NavLink>
          ))}
        </nav>
        <div className={styles.pie}>
          <img src={logoGris} alt="Universidad Nacional de Hurlingham" className={styles.logoPie} />
        </div>
      </aside>

      {menuAbierto && (
        <button
          type="button"
          className={styles.fondo}
          aria-label="Cerrar el menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* ── Contenido ── */}
      <main className={styles.contenido}>{children}</main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} HurData · Proyecto Integrador de Programación · Universidad Nacional de Hurlingham</span>
        <span>Fuente de los datos: Estadísticas de fin de cursada del SIU Guaraní</span>
      </footer>
    </div>
  );
}

export default AppShell;
