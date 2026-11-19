import { useEffect, useState } from 'react';
import styles from './Cargas.module.css';
import { getCargas } from '../services/api';
import { plural } from '../utils/texto';

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'activa', label: 'Activas' },
  { value: 'reemplazada', label: 'Reemplazadas' },
  { value: 'borrada', label: 'Borradas' },
];

const BADGE_POR_ESTADO = {
  activa: { clase: styles.badgeActiva, texto: 'Activa' },
  reemplazada: { clase: styles.badgeReemplazada, texto: 'Reemplazada' },
  borrada: { clase: styles.badgeBorrada, texto: 'Borrada' },
};

// El backend guarda las fechas en UTC (ISO 8601); se muestran en hora local
const formatearFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

/*
 * Historial de Excel cargados.
 * Admin y Directivo ven todas las cargas; el Docente solo las suyas
 * (lo decide el backend en GET /api/cargas).
 */
function Cargas() {
  const [estado, setEstado] = useState('');
  const [cargas, setCargas] = useState([]);
  const [veTodas, setVeTodas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    getCargas(estado || null)
      .then((data) => {
        if (cancelado) return;
        setCargas(data.cargas || []);
        setVeTodas(Boolean(data.ve_todas));
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setCargas([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, [estado]);

  const handleCambiarEstado = (e) => {
    setLoading(true);
    setEstado(e.target.value);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historial de Cargas</h1>
        <p className={styles.subtitle}>
          {veTodas
            ? 'Todos los Excel del SIU cargados en el sistema, incluidos los reemplazados y borrados.'
            : 'Los Excel del SIU que cargaste, incluidos los reemplazados y borrados.'}
        </p>
      </header>

      <div className={styles.toolbar}>
        <label htmlFor="filtro-estado">Estado</label>
        <select id="filtro-estado" className={styles.select} value={estado} onChange={handleCambiarEstado}>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>⚠️ {error}</p>}

      <section className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Archivo</th>
              <th>Cargado por</th>
              <th>Período</th>
              <th>Carrera</th>
              <th>Contenido</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.vacio}>Cargando historial...</td></tr>
            ) : cargas.length === 0 ? (
              <tr><td colSpan={8} className={styles.vacio}>No hay cargas para mostrar.</td></tr>
            ) : (
              cargas.map((c) => {
                const badge = BADGE_POR_ESTADO[c.estado] || { clase: styles.badge, texto: c.estado };
                return (
                  <tr key={c.id_carga}>
                    <td>{c.id_carga}</td>
                    <td>{formatearFecha(c.fecha)}</td>
                    <td>{c.nombre_archivo}</td>
                    <td>{c.cargado_por}</td>
                    <td>{c.periodo_label}</td>
                    <td>{c.nombre_carrera}</td>
                    <td>
                      {plural(c.materias, 'materia', 'materias')}
                      <span className={styles.detalle}>
                        {plural(c.comisiones, 'comisión', 'comisiones')} · {plural(c.resultados, 'resultado', 'resultados')}
                      </span>
                    </td>
                    <td>
                      <span className={badge.clase}>{badge.texto}</span>
                      {c.estado !== 'activa' && (
                        <span className={styles.detalle}>
                          por {c.dado_de_baja_por || '—'} · {formatearFecha(c.fecha_baja)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Cargas;
