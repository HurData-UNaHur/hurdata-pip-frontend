import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bell, BookOpen, Calculator, ChartLine, Check, ChevronLeft, ChevronRight, GraduationCap, House, KeyRound, LogOut, Menu, Upload, User, X,
} from 'lucide-react';
import styles from './AppShell.module.css';
import logo from '../assets/logo-hurlingham.png';
import logoGris from '../assets/logo-hurlingham-grisado.png';
import IconoTema from './IconoTema';
import Tooltip from './Tooltip';
import {
  PERMISOS,
  tienePermiso,
  getSolicitudesRegistro,
  aprobarSolicitudRegistro,
  rechazarSolicitudRegistro,
  getSolicitudesRecuperacion,
  resolverSolicitudRecuperacion,
} from '../services/api';

const ROLES_DISPONIBLES = [
  { id: 'directivo', nombre: 'Directivo' },
  { id: 'docente', nombre: 'Docente' },
  { id: 'no_docente', nombre: 'No Docente' },
];

/*
 * Marco de la aplicación: cabecera con el logo, barra lateral con las secciones (y, al pie,
 * el usuario, el tema y cerrar sesión), contenido y footer. En pantallas chicas la barra lateral
 * es un menú deslizable; en escritorio se puede comprimir a solo íconos.
 */
function AppShell({ theme, toggleTheme, usuario, onLogout, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false); // barra lateral (celular)
  // Barra lateral comprimida (solo íconos, en escritorio). Se recuerda entre sesiones.
  const [comprimida, setComprimida] = useState(() => localStorage.getItem('hurdata_sidebar_comprimida') === '1');

  // Estado para solicitudes de registro pendientes (Directivo / Admin)
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [recuperaciones, setRecuperaciones] = useState([]);     // pedidos de recuperación de contraseña
  const [codigosGenerados, setCodigosGenerados] = useState([]); // códigos recién aprobados (se ven una sola vez)
  const [rolesEditados, setRolesEditados] = useState({});
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [notifError, setNotifError] = useState(null);

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

  const secciones = [
    { to: '/', texto: 'Inicio', Icono: House, end: true },
    { to: '/materias', texto: 'Materias', Icono: BookOpen },
    { to: '/evolucion', texto: 'Evolución', Icono: ChartLine },
    { to: '/predicciones', texto: 'Predicciones', Icono: Calculator },
    ...(puedeVerCargas ? [{ to: '/cargas', texto: 'Cargas', Icono: Upload }] : []),
  ];

  // Cargar solicitudes pendientes cuando puedeAprobar es true y al abrir el modal
  useEffect(() => {
    if (!puedeAprobar) return;

    let cancelado = false;

    Promise.all([getSolicitudesRegistro(), getSolicitudesRecuperacion()])
      .then(([altas, recuperacion]) => {
        if (!cancelado) {
          setSolicitudes(Array.isArray(altas) ? altas : altas.solicitudes || []);
          setRecuperaciones(recuperacion.solicitudes || []);
          setNotifError(null);
        }
      })
      .catch((err) => {
        if (!cancelado && isNotifOpen) {
          setNotifError(err.message);
        }
      })
      .finally(() => {
        if (!cancelado) setLoadingNotif(false);
      });

    return () => {
      cancelado = true;
    };
  }, [puedeAprobar, isNotifOpen]);

  const handleAprobar = async (id, rolOriginal) => {
    const rolFinal = rolesEditados[id] || rolOriginal;
    setProcesandoId(id);
    setNotifError(null);
    try {
      await aprobarSolicitudRegistro(id, rolFinal);
      setSolicitudes((prev) => prev.filter((s) => (s.id ?? s.id_solicitud) !== id));
    } catch (err) {
      setNotifError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleRechazar = async (id) => {
    setProcesandoId(id);
    setNotifError(null);
    try {
      await rechazarSolicitudRegistro(id);
      setSolicitudes((prev) => prev.filter((s) => (s.id ?? s.id_solicitud) !== id));
    } catch (err) {
      setNotifError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleRecuperacion = async (sol, accion) => {
    setProcesandoId(`rec-${sol.id_solicitud}`);
    setNotifError(null);
    try {
      const resp = await resolverSolicitudRecuperacion(sol.id_solicitud, accion);
      setRecuperaciones((prev) => prev.filter((r) => r.id_solicitud !== sol.id_solicitud));
      if (accion === 'aprobar') {
        setCodigosGenerados((prev) => [...prev, { id: sol.id_solicitud, usuario: sol.usuario, codigo: resp.codigo }]);
      }
    } catch (err) {
      setNotifError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const pendientes = solicitudes.length + recuperaciones.length;
  const hayRecuperaciones = recuperaciones.length > 0 || codigosGenerados.length > 0;

  // Cerrar el menú del celular o el modal con Escape
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        setMenuAbierto(false);
        setIsNotifOpen(false);
      }
    };
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
            {secciones.map(({ to, texto, Icono, end }) => (
              <Tooltip key={to} texto={comprimida ? texto : undefined}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setMenuAbierto(false)}
                  className={({ isActive }) => (isActive ? `${styles.item} ${styles.itemActivo}` : styles.item)}
                >
                  <Icono size={19} aria-hidden="true" />
                  <span className={styles.textoItem}>{texto}</span>
                </NavLink>
              </Tooltip>
            ))}
          </nav>

          <div className={styles.pie}>
            {usuario && (
              <Tooltip texto={comprimida ? `${usuario.nombre}${usuario.cargo ? `, ${usuario.cargo}` : ''}` : undefined} enfocable>
              <div className={styles.perfil}>
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
              </Tooltip>
            )}

            {puedeAprobar && (
              <Tooltip texto="Solicitudes de registro y de recuperación de contraseña pendientes">
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => {
                    setMenuAbierto(false);
                    setLoadingNotif(true);
                    setIsNotifOpen(true);
                  }}
                >
                  <span className={styles.campanaWrap}>
                    <Bell size={19} aria-hidden="true" />
                    {pendientes > 0 && (
                      <span className={styles.badgeNotif}>{pendientes}</span>
                    )}
                  </span>
                  <span className={styles.textoItem}>
                    Solicitudes{pendientes > 0 ? ` (${pendientes})` : ''}
                  </span>
                </button>
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
      <main className={styles.contenido}>{children}</main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} HurData. Proyecto Integrador de Programación, Universidad Nacional de Hurlingham</span>
        <img src={logoGris} alt="Universidad Nacional de Hurlingham" className={styles.logoFooter} />
      </footer>

      {/* ── Modal de aprobación de solicitudes de registro ── */}
      {puedeAprobar && isNotifOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsNotifOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Tooltip texto="Cerrar">
              <button
                type="button"
                className={styles.modalCerrar}
                onClick={() => setIsNotifOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </Tooltip>

            <h3 className={styles.modalTitulo}>Solicitudes de registro pendientes</h3>
            <p className={styles.modalSubtitulo}>
              Revisá los datos, modificá el rol asignado si corresponde y aprobá o rechazá la solicitud.
            </p>

            {notifError && <p className={styles.modalError}>{notifError}</p>}

            {loadingNotif ? (
              <p className={styles.modalVacio}>Cargando solicitudes…</p>
            ) : solicitudes.length === 0 ? (
              hayRecuperaciones ? null : <p className={styles.modalVacio}>No hay solicitudes pendientes en este momento.</p>
            ) : (
              <div className={styles.listaSolicitudes}>
                {solicitudes.map((sol) => {
                  const idSol = sol.id ?? sol.id_solicitud;
                  const rolActual = rolesEditados[idSol] ?? sol.rol;
                  const institutoNombre = sol.nombre_instituto || sol.instituto;

                  return (
                    <div key={idSol} className={styles.itemSolicitud}>
                      <div className={styles.infoSolicitud}>
                        <strong className={styles.nombreSolicitud}>{sol.nombre}</strong>
                        <span className={styles.emailSolicitud}>{sol.email}</span>
                        {institutoNombre && (
                          <span className={styles.institutoSolicitud}>
                            Instituto: {institutoNombre}
                          </span>
                        )}

                        {/* Bloquesito para modificar el rol antes de aprobar */}
                        <div className={styles.bloqueRol}>
                          <label htmlFor={`rol-sol-${idSol}`} className={styles.labelRol}>
                            Rol a asignar:
                          </label>
                          <select
                            id={`rol-sol-${idSol}`}
                            className={styles.selectRol}
                            value={rolActual}
                            disabled={procesandoId === idSol}
                            onChange={(e) =>
                              setRolesEditados((prev) => ({ ...prev, [idSol]: e.target.value }))
                            }
                          >
                            {ROLES_DISPONIBLES.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className={styles.accionesSolicitud}>
                        <button
                          type="button"
                          className={styles.btnAprobar}
                          disabled={procesandoId === idSol}
                          onClick={() => handleAprobar(idSol, sol.rol)}
                        >
                          <Check size={15} aria-hidden="true" />
                          Aprobar
                        </button>
                        <button
                          type="button"
                          className={styles.btnRechazar}
                          disabled={procesandoId === idSol}
                          onClick={() => handleRechazar(idSol)}
                        >
                          <X size={15} aria-hidden="true" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Recuperación de contraseña: se aprueba y se le pasa el código a la persona ── */}
            {!loadingNotif && hayRecuperaciones && (
              <section className={styles.seccionModal} aria-label="Recuperación de contraseña">
                <h4 className={styles.modalSeccion}>
                  <KeyRound size={16} aria-hidden="true" />
                  Recuperación de contraseña
                </h4>

                {codigosGenerados.map((c) => (
                  <div key={c.id} className={styles.cajaCodigo} role="status">
                    <p>
                      Código para <strong>{c.usuario}</strong>. Pasáselo en persona o por un canal de confianza.
                      Vale 60 minutos, se usa una sola vez y no se vuelve a mostrar.
                    </p>
                    <code className={styles.codigoTexto}>{c.codigo}</code>
                    <button
                      type="button"
                      className={styles.btnRechazar}
                      onClick={() => setCodigosGenerados((prev) => prev.filter((x) => x.id !== c.id))}
                    >
                      Listo, ya lo anoté
                    </button>
                  </div>
                ))}

                <div className={styles.listaSolicitudes}>
                  {recuperaciones.map((sol) => {
                    const ocupado = procesandoId === `rec-${sol.id_solicitud}`;
                    return (
                      <div key={sol.id_solicitud} className={styles.itemSolicitud}>
                        <div className={styles.infoSolicitud}>
                          <strong className={styles.nombreSolicitud}>{sol.nombre}</strong>
                          <span className={styles.emailSolicitud}>{sol.usuario}</span>
                          <span className={styles.institutoSolicitud}>
                            Pide restablecer su contraseña. Confirmá que es la persona antes de aprobar.
                          </span>
                        </div>
                        <div className={styles.accionesSolicitud}>
                          <button
                            type="button"
                            className={styles.btnAprobar}
                            disabled={ocupado}
                            onClick={() => handleRecuperacion(sol, 'aprobar')}
                          >
                            <Check size={15} aria-hidden="true" />
                            Aprobar
                          </button>
                          <button
                            type="button"
                            className={styles.btnRechazar}
                            disabled={ocupado}
                            onClick={() => handleRecuperacion(sol, 'rechazar')}
                          >
                            <X size={15} aria-hidden="true" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;