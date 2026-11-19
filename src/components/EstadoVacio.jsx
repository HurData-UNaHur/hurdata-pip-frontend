import { Link } from 'react-router-dom';
import { FileSpreadsheet, TriangleAlert, Upload } from 'lucide-react';
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
    // Bloques grises con la forma de la página: filtros, 4 tarjetas y 2 paneles
    return (
      <div className={styles.skeletonPagina} role="status" aria-label="Cargando datos">
        <div className={styles.skeletonFiltros}>
          {[0, 1, 2, 3].map((i) => <div key={i} className={`skeleton ${styles.skFiltro}`} />)}
        </div>
        <div className={styles.skeletonKpis}>
          {[0, 1, 2, 3].map((i) => <div key={i} className={`skeleton ${styles.skKpi}`} />)}
        </div>
        <div className={styles.skeletonPaneles}>
          <div className={`skeleton ${styles.skPanel}`} />
          <div className={`skeleton ${styles.skPanel}`} />
        </div>
      </div>
    );
  }

  if (estado === 'error') {
    return (
      <section className={`${styles.caja} ${styles.error}`} role="alert">
        <TriangleAlert size={28} className={styles.iconoError} aria-hidden="true" />
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
      <FileSpreadsheet size={28} className={styles.iconoVacio} aria-hidden="true" />
      <p className={styles.titulo}>Todavía no hay datos cargados.</p>
      {puedeCargar ? (
        <>
          <p className={styles.texto}>Subí el Excel de fin de cursada del SIU para empezar.</p>
          <Link to="/cargas" className={styles.btnPrimario}>
            <Upload size={16} className="icono-inline" aria-hidden="true" />
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
