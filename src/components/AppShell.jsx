import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen, Calculator, ChartLine, ChevronLeft, ChevronRight, GraduationCap, House, LogOut, Menu, Upload, User, X,
} from 'lucide-react';
import styles from './AppShell.module.css';
import logo from '../assets/logo-hurlingham.png';
import logoGris from '../assets/logo-hurlingham-grisado.png';
import IconoTema from './IconoTema';
import { PERMISOS, tienePermiso } from '../services/api';

/*
 * Marco de la aplicación: cabecera con el logo, barra lateral con las secciones (y, al pie,
 * el usuario, el tema y cerrar sesión), contenido y footer. En pantallas chicas la barra lateral
 * es un menú deslizable; en escritorio se puede comprimir a solo íconos.
 */
function AppShell({ theme, toggleTheme, usuario, onLogout, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false); // barra lateral (celular)
  // Barra lateral comprimida (solo íconos, en escritorio). Se recuerda entre sesiones.
  const [comprimida, setComprimida] = useState(() => localStorage.getItem('hurdata_sidebar_comprimida') === '1');

  const alternarCompresion = () => {
    setComprimida((v) => {
      localStorage.setItem('hurdata_sidebar_comprimida', v ? '0' : '1');
      return !v;
    });
  };

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

  // Cerrar el menú del celular con Escape
  useEffect(() => {
    const alTeclear = (e) => { if (e.key === 'Escape') setMenuAbierto(false); };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, []);

  const textoTema = theme === 'light' ? 'Modo oscuro' : 'Modo claro';

  return (
    <div className={comprimida ? `${styles.shell} ${styles.comprimido}` : styles.shell}>
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

        <span className={styles.logoCaja}>
          <img src={logo} alt="Universidad Nacional de Hurlingham" className={styles.logoCabecera} />
        </span>
      </header>

      {/* ── Barra lateral ── */}
      <aside className={`${styles.sidebar} ${menuAbierto ? styles.sidebarAbierta : ''}`} aria-label="Secciones">
        {/* Botón sobre el borde de la barra (solo escritorio) */}
        <button
          type="button"
          className={styles.colapsar}
          onClick={alternarCompresion}
          aria-label={comprimida ? 'Expandir la barra lateral' : 'Comprimir la barra lateral'}
          title={comprimida ? 'Expandir' : 'Comprimir'}
        >
          {comprimida
            ? <ChevronRight size={16} aria-hidden="true" />
            : <ChevronLeft size={16} aria-hidden="true" />}
        </button>

        <div className={styles.interior}>
          <nav className={styles.menu}>
            {secciones.map(({ to, texto, Icono, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuAbierto(false)}
                title={comprimida ? texto : undefined}
                className={({ isActive }) => (isActive ? `${styles.item} ${styles.itemActivo}` : styles.item)}
              >
                <Icono size={19} aria-hidden="true" />
                <span className={styles.textoItem}>{texto}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.pie}>
            {usuario && (
              <div className={styles.perfil} title={usuario.cargo || usuario.nombre}>
                <span className={styles.avatar}>
                  {esAutorizado
                    ? <GraduationCap size={17} aria-hidden="true" />
                    : <User size={17} aria-hidden="true" />}
                </span>
                <span className={`${styles.textoItem} ${styles.datosPerfil}`}>
                  <strong>{usuario.nombre}</strong>
                  {usuario.cargo && <small>{usuario.cargo}</small>}
                </span>
              </div>
            )}
            <button
              type="button"
              className={styles.item}
              onClick={toggleTheme}
              title={comprimida ? textoTema : undefined}
            >
              <IconoTema theme={theme} size={19} sobreVerde />
              <span className={styles.textoItem}>{textoTema}</span>
            </button>
            {onLogout && (
              <button
                type="button"
                className={`${styles.item} ${styles.cerrar}`}
                onClick={onLogout}
                title={comprimida ? 'Cerrar sesión' : undefined}
              >
                <LogOut size={19} aria-hidden="true" />
                <span className={styles.textoItem}>Cerrar sesión</span>
              </button>
            )}
          </div>
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
        <img src={logoGris} alt="Universidad Nacional de Hurlingham" className={styles.logoFooter} />
      </footer>
    </div>
  );
}

export default AppShell;
