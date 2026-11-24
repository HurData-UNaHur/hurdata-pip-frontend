import { useCallback, useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import styles from '../Gestion.module.css';
import { getHistorialSolicitudes } from '../../services/api';
import { formatearFechaCorta } from '../../utils/texto';

const NOMBRE_ROL = {
  admin: 'Administrador',
  directivo: 'Directivo',
  docente: 'Docente',
  no_docente: 'No docente',
};

/*
 * Solicitudes de registro ya resueltas, aprobadas y rechazadas.
 * El Admin ve todas; un Directivo, solo las de su instituto (lo filtra el backend).
 */
export default function PestanaHistorial() {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    getHistorialSolicitudes()
      .then((datos) => { setLista(datos.solicitudes); setError(''); })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (error) {
    return (
      <p className={styles.error} role="alert">
        <TriangleAlert size={16} aria-hidden="true" />
        <span>{error}</span>
        <button type="button" className={styles.boton} onClick={cargar}>Reintentar</button>
      </p>
    );
  }
  if (!lista) return <p className={styles.mensaje}>Cargando…</p>;
  if (lista.length === 0) return <p className={styles.mensaje}>Todavía no hay solicitudes resueltas.</p>;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <caption className="sr-only">Solicitudes de registro resueltas</caption>
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
  );
}
