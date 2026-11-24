import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen, Calculator, ChartLine, ChevronLeft, ChevronRight, GraduationCap, House, LogOut, Menu,
  ShieldCheck, Upload, User, X,
} from 'lucide-react';
import styles from './AppShell.module.css';
import logo from '../assets/logo-hurlingham.png';
import logoGris from '../assets/logo-hurlingham-grisado.png';
import IconoTema from './IconoTema';
import Tooltip from './Tooltip';
import { ContextoPendientes } from './contextoPendientes';
import {
  PERMISOS,
  tienePermiso,
  getSolicitudesRegistro,
  getSolicitudesRecuperacion,
} from '../services/api';

/*
 * Marco de la aplicación: cabecera con el logo, barra lateral con las secciones (y, al pie,
 * el usuario, el tema y cerrar sesión), contenido y footer. En pantallas chicas la barra lateral
 * es un menú deslizable; en escritorio se puede comprimir a solo íconos.
 *
 * También lleva la cuenta de solicitudes pendientes (registro y recuperación de contraseña) que se
 * muestra junto a "Accesos". Las pantallas la actualizan con `refrescar` (contextoPendientes.js).
 */

// Título de la pestaña según la sección: cada pantalla tiene que tener el suyo (WCAG 2.4.2)
const TITULOS = {
  '/': 'Inicio',
  '/materias': 'Materias',
  '/evolucion': 'Evolución',
  '/predicciones': 'Simulador de comisiones',
  '/cargas': 'Cargas',
  '/accesos': 'Accesos',
  '/cuenta': 'Mi cuenta',
};

function AppShell({ theme, toggleTheme, usuario, onLogout, children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const seccion = TITULOS[pathname];
    document.title = seccion ? `${seccion} - HurData Académico` : 'HurData Académico';
  }, [pathname]);

  const [menuAbierto, setMenuAbierto] = useState(false); // barra lateral (celular)
  // Barra lateral comprimida (solo íconos, en escritorio). Se recuerda entre sesiones.
  const [comprimida, setComprimida] = useState(() => localStorage.getItem('hurdata_sidebar_comprimida') === '1');
  const [pendientes, setPendientes] = useState(0);

  const alternarCompresion = () => {
    setComprimida((v) => {
      localStorage.setItem('hurdata_sidebar_comprimida', v ? '0' : '1');
      return !v;
    });
  };

  // Usuario con login real (no invitado)
  const esAutorizado = Boolean(usuario) && usuario.role !== 'invitado';
  const puedeVerCargas = tienePermiso(usuario, PERMISOS.VER_CARGAS);
  const puedeAprobar = tienePermiso(usuario, PERMISOS.APROBAR_REGISTROS);

  // Solicitudes pendientes: se consultan al entrar y al cambiar de pantalla, y cuando Accesos las resuelve
  const refrescar = useCallback(() => {
    if (!puedeAprobar) return;
    Promise.all([getSolicitudesRegistro(), getSolicitudesRecuperacion()])
      .then(([altas, recuperacion]) => {
        const lista = Array.isArray(altas) ? altas : altas.solicitudes || [];
        setPendientes(lista.length + (recuperacion.solicitudes || []).length);
      })
      .catch(() => { /* sin conexión: queda el último número conocido */ });
  }, [puedeAprobar]);

  useEffect(() => { refrescar(); }, [refrescar, pathname]);

  const contextoPendientes = useMemo(() => ({ pendientes, refrescar }), [pendientes, refrescar]);

  const secciones = [
    { to: '/', texto: 'Inicio', Icono: House, end: true },
    { to: '/materias', texto: 'Materias', Icono: BookOpen },
    { to: '/evolucion', texto: 'Evolución', Icono: ChartLine },
    { to: '/predicciones', texto: 'Simulador de comisiones', Icono: Calculator },
    ...(puedeVerCargas ? [{ to: '/cargas', texto: 'Cargas', Icono: Upload }] : []),
    ...(puedeAprobar ? [{ to: '/accesos', texto: 'Accesos', Icono: ShieldCheck, contador: pendientes }] : []),
  ];

  // Cerrar el menú del celular con Escape
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') setMenuAbierto(false);
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, []);

  const textoTema = theme === 'light' ? 'Modo oscuro' : 'Modo claro';

  return (
    <div className={comprimida ? `${styles.shell} ${styles.comprimido}` : styles.shell}>
      {/* Primer elemento de la página: con Tab aparece y salta la cabecera y el menú */}
      <a href="#contenido" className={styles.saltar}>Saltar al contenido</a>

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

        {/* El logo lleva a Inicio */}
        <Link to="/" className={styles.logoCaja} onClick={() => setMenuAbierto(false)} aria-label="Ir a Inicio">
          <img src={logo} alt="Universidad Nacional de Hurlingham" className={styles.logoCabecera} />
        </Link>
      </header>

      {/* ── Barra lateral ── */}
      <aside className={`${styles.sidebar} ${menuAbierto ? styles.sidebarAbierta : ''}`} aria-label="Secciones">
        {/* Botón sobre el borde de la barra (solo escritorio) */}
        <Tooltip texto={comprimida ? 'Expandir' : 'Comprimir'}>
          <button
            type="button"
            className={styles.colapsar}
            onClick={alternarCompresion}
            aria-label={comprimida ? 'Expandir la barra lateral' : 'Comprimir la barra lateral'}
          >
            {comprimida
              ? <ChevronRight size={16} aria-hidden="true" />
              : <ChevronLeft size={16} aria-hidden="true" />}
          </button>
        </Tooltip>

        <div className={styles.interior}>
          <nav className={styles.menu}>
            {secciones.map(({ to, texto, Icono, end, contador = 0 }) => (
              <Tooltip key={to} texto={comprimida ? (contador > 0 ? `${texto} (${contador})` : texto) : undefined}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setMenuAbierto(false)}
                  className={({ isActive }) => (isActive ? `${styles.item} ${styles.itemActivo}` : styles.item)}
                >
                  {contador > 0 ? (
                    <span className={styles.campanaWrap}>
                      <Icono size={19} aria-hidden="true" />
                      <span className={styles.badgeNotif} aria-hidden="true">{contador}</span>
                    </span>
                  ) : (
                    <Icono size={19} aria-hidden="true" />
                  )}
                  <span className={styles.textoItem}>
                    {texto}
                    {contador > 0 && <span className="sr-only"> ({contador} pendientes)</span>}
                  </span>
                </NavLink>
              </Tooltip>
            ))}
          </nav>

          <div className={styles.pie}>
            {usuario && (
              <Tooltip texto={comprimida ? `${usuario.nombre}${usuario.cargo ? `, ${usuario.cargo}` : ''}` : undefined}>
                <NavLink
                  to="/cuenta"
                  onClick={() => setMenuAbierto(false)}
                  aria-label={`Mi cuenta: ${usuario.nombre}`}
                  className={({ isActive }) => (isActive ? [styles.perfil, styles.perfilActivo].join(' ') : styles.perfil)}
                >
                  <span className={styles.avatar}>
                    {esAutorizado
                      ? <GraduationCap size={17} aria-hidden="true" />
                      : <User size={17} aria-hidden="true" />}
                  </span>
                  <span className={`${styles.textoItem} ${styles.datosPerfil}`}>
                    <strong>{usuario.nombre}</strong>
                    {usuario.cargo && <small>{usuario.cargo}</small>}
                  </span>
                </NavLink>
              </Tooltip>
            )}
            <Tooltip texto={comprimida ? textoTema : undefined}>
              <button type="button" className={styles.item} onClick={toggleTheme}>
                <IconoTema theme={theme} size={19} sobreVerde />
                <span className={styles.textoItem}>{textoTema}</span>
              </button>
            </Tooltip>
            {onLogout && (
              <Tooltip texto={comprimida ? 'Cerrar sesión' : undefined}>
                <button type="button" className={`${styles.item} ${styles.cerrar}`} onClick={onLogout}>
                  <LogOut size={19} aria-hidden="true" />
                  <span className={styles.textoItem}>Cerrar sesión</span>
                </button>
              </Tooltip>
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
      <main id="contenido" tabIndex={-1} className={styles.contenido}>
        <ContextoPendientes.Provider value={contextoPendientes}>{children}</ContextoPendientes.Provider>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} HurData. Proyecto Integrador de Programación, Universidad Nacional de Hurlingham</span>
        <img src={logoGris} alt="Universidad Nacional de Hurlingham" className={styles.logoFooter} />
      </footer>
    </div>
  );
}

export default AppShell;
