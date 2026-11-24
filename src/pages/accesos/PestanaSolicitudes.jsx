import { useCallback, useEffect, useState } from 'react';
import { Check, KeyRound, TriangleAlert, UserPlus, X } from 'lucide-react';
import styles from '../Gestion.module.css';
import { useToast } from '../../components/contextoToast';
import { usePendientes } from '../../components/contextoPendientes';
import {
  aprobarSolicitudRegistro,
  getSolicitudesRecuperacion,
  getSolicitudesRegistro,
  rechazarSolicitudRegistro,
  resolverSolicitudRecuperacion,
} from '../../services/api';

const ROLES_DISPONIBLES = [
  { id: 'directivo', nombre: 'Directivo' },
  { id: 'docente', nombre: 'Docente' },
  { id: 'no_docente', nombre: 'No docente' },
];

/*
 * Solicitudes pendientes: pedidos de registro (se aprueban eligiendo el rol) y pedidos de recuperación
 * de contraseña (al aprobar se genera un código de un solo uso para pasarle a la persona).
 *
 *   codigos / setCodigos: los códigos recién generados viven en la pantalla Accesos, así no se pierden
 *                         al cambiar de pestaña. Se muestran una sola vez.
 */
export default function PestanaSolicitudes({ codigos, setCodigos }) {
  const { avisar } = useToast();
  const { refrescar } = usePendientes();
  const [altas, setAltas] = useState(null);
  const [recuperaciones, setRecuperaciones] = useState(null);
  const [rolesEditados, setRolesEditados] = useState({});
  const [procesando, setProcesando] = useState('');
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    Promise.all([getSolicitudesRegistro(), getSolicitudesRecuperacion()])
      .then(([registro, recuperacion]) => {
        setAltas(Array.isArray(registro) ? registro : registro.solicitudes || []);
        setRecuperaciones(recuperacion.solicitudes || []);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Después de resolver algo, se actualiza el contador de la barra lateral
  const terminar = () => { setProcesando(''); refrescar(); };

  const aprobarAlta = async (sol) => {
    const id = sol.id ?? sol.id_solicitud;
    const rol = rolesEditados[id] ?? sol.rol;
    setProcesando(`alta-${id}`);
    try {
      await aprobarSolicitudRegistro(id, rol);
      setAltas((prev) => prev.filter((s) => (s.id ?? s.id_solicitud) !== id));
      const nombreRol = ROLES_DISPONIBLES.find((r) => r.id === rol)?.nombre.toLowerCase();
      avisar({ tipo: 'exito', texto: `Se aprobó el acceso de ${sol.nombre}${nombreRol ? ` como ${nombreRol}` : ''}.` });
    } catch (err) {
      avisar({ tipo: 'error', texto: err.message });
    } finally {
      terminar();
    }
  };

  const rechazarAlta = async (sol) => {
    const id = sol.id ?? sol.id_solicitud;
    setProcesando(`alta-${id}`);
    try {
      await rechazarSolicitudRegistro(id);
      setAltas((prev) => prev.filter((s) => (s.id ?? s.id_solicitud) !== id));
      avisar({ tipo: 'info', texto: `Se rechazó la solicitud de ${sol.nombre}.` });
    } catch (err) {
      avisar({ tipo: 'error', texto: err.message });
    } finally {
      terminar();
    }
  };

  const resolverRecuperacion = async (sol, accion) => {
    setProcesando(`rec-${sol.id_solicitud}`);
    try {
      const resp = await resolverSolicitudRecuperacion(sol.id_solicitud, accion);
      setRecuperaciones((prev) => prev.filter((r) => r.id_solicitud !== sol.id_solicitud));
      if (accion === 'aprobar') {
        // El código se muestra en pantalla y no se repite en un aviso
        setCodigos((prev) => [...prev, { id: sol.id_solicitud, usuario: sol.usuario, codigo: resp.codigo }]);
      } else {
        avisar({ tipo: 'info', texto: `Se rechazó el pedido de recuperación de ${sol.usuario}.` });
      }
    } catch (err) {
      avisar({ tipo: 'error', texto: err.message });
    } finally {
      terminar();
    }
  };

  if (error) {
    return (
      <p className={styles.error} role="alert">
        <TriangleAlert size={16} aria-hidden="true" />
        <span>{error}</span>
        <button type="button" className={styles.boton} onClick={cargar}>Reintentar</button>
      </p>
    );
  }
  if (!altas || !recuperaciones) return <p className={styles.mensaje}>Cargando…</p>;

  const sinNada = altas.length === 0 && recuperaciones.length === 0 && codigos.length === 0;
  if (sinNada) return <p className={styles.mensaje}>No hay solicitudes pendientes en este momento.</p>;

  return (
    <div className={styles.grupos}>
      {/* Códigos recién generados: se ven una sola vez */}
      {codigos.map((c) => (
        <div key={c.id} className={styles.cajaCodigo} role="status">
          <p>
            Código para <strong>{c.usuario}</strong>. Pasáselo en persona o por un canal de confianza. Vale 60 minutos,
            se usa una sola vez y no se vuelve a mostrar: anotalo antes de salir de esta pantalla.
          </p>
          <code className={styles.codigoTexto}>{c.codigo}</code>
          <button
            type="button"
            className={styles.boton}
            onClick={() => setCodigos((prev) => prev.filter((x) => x.id !== c.id))}
          >
            Listo, ya lo anoté
          </button>
        </div>
      ))}

      {altas.length > 0 && (
        <section aria-labelledby="sol-registro" className={styles.grupo}>
          <h3 id="sol-registro" className={styles.grupoTitulo}>
            <UserPlus size={16} aria-hidden="true" />
            Pedidos de registro
          </h3>
          <ul className={styles.lista}>
            {altas.map((sol) => {
              const id = sol.id ?? sol.id_solicitud;
              const ocupado = procesando === `alta-${id}`;
              const instituto = sol.nombre_instituto || sol.instituto;
              return (
                <li key={id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <strong>{sol.nombre}</strong>
                    <span className={styles.detalle}>{sol.email}</span>
                    {instituto && <span className={styles.detalle}>Instituto: {instituto}</span>}
                    <label className={styles.bloqueRol}>
                      <span>Rol a asignar</span>
                      <select
                        className={styles.selectRol}
                        value={rolesEditados[id] ?? sol.rol}
                        disabled={ocupado}
                        onChange={(e) => setRolesEditados((prev) => ({ ...prev, [id]: e.target.value }))}
                      >
                        {ROLES_DISPONIBLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className={styles.acciones}>
                    <button type="button" className={styles.btnAprobar} disabled={ocupado} onClick={() => aprobarAlta(sol)}>
                      <Check size={15} aria-hidden="true" />
                      Aprobar
                    </button>
                    <button type="button" className={styles.btnRechazar} disabled={ocupado} onClick={() => rechazarAlta(sol)}>
                      <X size={15} aria-hidden="true" />
                      Rechazar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {recuperaciones.length > 0 && (
        <section aria-labelledby="sol-recuperacion" className={styles.grupo}>
          <h3 id="sol-recuperacion" className={styles.grupoTitulo}>
            <KeyRound size={16} aria-hidden="true" />
            Recuperación de contraseña
          </h3>
          <ul className={styles.lista}>
            {recuperaciones.map((sol) => {
              const ocupado = procesando === `rec-${sol.id_solicitud}`;
              return (
                <li key={sol.id_solicitud} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <strong>{sol.nombre}</strong>
                    <span className={styles.detalle}>{sol.usuario}</span>
                    <span className={styles.detalle}>
                      Pide restablecer su contraseña. Confirmá que es la persona antes de aprobar.
                    </span>
                  </div>
                  <div className={styles.acciones}>
                    <button
                      type="button"
                      className={styles.btnAprobar}
                      disabled={ocupado}
                      onClick={() => resolverRecuperacion(sol, 'aprobar')}
                    >
                      <Check size={15} aria-hidden="true" />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      className={styles.btnRechazar}
                      disabled={ocupado}
                      onClick={() => resolverRecuperacion(sol, 'rechazar')}
                    >
                      <X size={15} aria-hidden="true" />
                      Rechazar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
