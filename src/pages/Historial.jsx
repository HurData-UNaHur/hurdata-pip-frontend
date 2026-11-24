import { useCallback, useEffect, useId, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import styles from './Gestion.module.css';
import { getHistorialSolicitudes, PERMISOS, tienePermiso } from '../services/api';
import { formatearFechaCorta } from '../utils/texto';

const NOMBRE_ROL = {
  admin: 'Administrador',
  directivo: 'Directivo',
  docente: 'Docente',
  no_docente: 'No docente',
};

/*
 * Historial de solicitudes de registro ya resueltas, aprobadas y rechazadas.
 * El Admin ve todas; un Directivo, solo las de su instituto (lo filtra el backend).
 */
function Historial({ usuario }) {
  const idTitulo = useId();
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const veTodas = tienePermiso(usuario, PERMISOS.GESTIONAR_USUARIOS);

  const cargar = useCallback(() => {
    getHistorialSolicitudes()
      .then((datos) => { setLista(datos.solicitudes); setError(''); })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historial de solicitudes</h1>
        <p className={styles.subtitle}>
          {veTodas
            ? 'Solicitudes de registro aprobadas y rechazadas, de todos los institutos.'
            : 'Solicitudes de registro aprobadas y rechazadas de tu instituto.'}
        </p>
      </header>

      <section className={styles.card} aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className="sr-only">Solicitudes resueltas</h2>
        {error ? (
          <p className={styles.error} role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            <span>{error}</span>
            <button type="button" className={styles.boton} onClick={cargar}>Reintentar</button>
          </p>
        ) : !lista ? (
          <p className={styles.mensaje}>Cargando…</p>
        ) : lista.length === 0 ? (
          <p className={styles.mensaje}>Todavía no hay solicitudes resueltas.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Resuelta</th>
                  <th scope="col">Persona</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Instituto</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Resuelta por</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((s) => (
                  <tr key={s.id_solicitud}>
                    <td>
                      {formatearFechaCorta(s.fecha_resolucion)}
                      <small className={styles.detalle}>Pedida: {formatearFechaCorta(s.fecha_solicitud)}</small>
                    </td>
                    <td className={styles.persona}>
                      <strong>{s.nombre}</strong>
                      <small>{s.email}</small>
                    </td>
                    <td>{NOMBRE_ROL[s.rol] ?? s.rol}</td>
                    <td>{s.nombre_instituto}</td>
                    <td>
                      <span className={`${styles.etiqueta} ${s.estado === 'aprobada' ? styles.ok : styles.no}`}>
                        {s.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                      </span>
                    </td>
                    <td className={styles.persona}>
                      <strong>{s.nombre_resuelto_por ?? s.resuelto_por ?? '—'}</strong>
                      {s.nombre_resuelto_por && <small>{s.resuelto_por}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Historial;
