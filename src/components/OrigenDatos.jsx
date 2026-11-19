import { useEffect, useState } from 'react';
import styles from './OrigenDatos.module.css';
import { getCargaActiva } from '../services/api';
import { formatearFechaCorta } from '../utils/texto';

/*
 * De qué Excel salen los datos del período + carrera seleccionados.
 * Solo para usuarios logueados: GET /api/carga-activa requiere login.
 * Si no hay carga activa o falla la consulta, no muestra nada.
 */
export default function OrigenDatos({ periodo, carrera }) {
  const [carga, setCarga] = useState(null);

  useEffect(() => {
    let cancelado = false;
    if (!periodo || !carrera) return undefined;
    getCargaActiva(periodo, carrera)
      .then((data) => { if (!cancelado) setCarga(data.carga); })
      .catch(() => { if (!cancelado) setCarga(null); });
    return () => { cancelado = true; };
  }, [periodo, carrera]);

  if (!periodo || !carrera || !carga) return null;

  return (
    <p className={styles.origen}>
      📄 Datos de <span className={styles.archivo}>{carga.nombre_archivo}</span>
      {' · '}cargado por {carga.cargado_por} el {formatearFechaCorta(carga.fecha)}
    </p>
  );
}
