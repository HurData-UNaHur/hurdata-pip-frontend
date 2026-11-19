import { Link } from 'react-router-dom';
import styles from './EstadoVacio.module.css';

/*
 * Reemplaza filtros, tarjetas y gráficos cuando no hay nada que mostrar.
 *
 *   estado: 'cargando' | 'error' (backend caído) | 'vacio' (DB sin datos)
 *   puedeCargar: muestra el botón que lleva a /cargas
 *   onReintentar: vuelve a pedir los datos (estado 'error')
 */
export default function EstadoVacio({ estado, puedeCargar, onReintentar }) {
  if (estado === 'cargando') {
    return (
      <section className={styles.caja} aria-live="polite">
        <p className={styles.texto}>Cargando datos...</p>
      </section>
    );
  }

  if (estado === 'error') {
    return (
      <section className={`${styles.caja} ${styles.error}`} role="alert">
        <p className={styles.titulo}>No se pudo conectar con el servidor.</p>
        <p className={styles.texto}>Revisá tu conexión o intentá de nuevo en unos minutos.</p>
        <button type="button" className={styles.btnSecundario} onClick={onReintentar}>
          Reintentar
        </button>
      </section>
    );
  }

  // 'vacio': la base no tiene datos cargados
  return (
    <section className={styles.caja}>
      <p className={styles.titulo}>Todavía no hay datos cargados.</p>
      {puedeCargar ? (
        <>
          <p className={styles.texto}>Subí el Excel de fin de cursada del SIU para empezar.</p>
          <Link to="/cargas" className={styles.btnPrimario}>
            Subir Excel del SIU
          </Link>
        </>
      ) : (
        <p className={styles.texto}>
          Un docente o directivo tiene que subir el Excel del período.
        </p>
      )}
    </section>
  );
}
