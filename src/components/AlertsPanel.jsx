import { TriangleAlert } from 'lucide-react';
import styles from './AlertsPanel.module.css';
import { plural } from '../utils/texto';
import { UMBRAL_ALERTA_COMISION } from '../utils/umbrales';

function AlertsPanel({ comisiones }) {
  // Filtramos las comisiones con deserción >= 40%
  const alertas = comisiones.filter((c) => {
    const pctLibre = (c.libre / c.total) * 100;
    return pctLibre >= UMBRAL_ALERTA_COMISION;
  });

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        <span>Alertas académicas</span>
      </div>
      {/* Avisen del Emoji aca */}
      {alertas.length > 0 ? (
        alertas.map((c, index) => {
          const pctLibre = ((c.libre / c.total) * 100).toFixed(1);
          return (
            <div key={index} className={styles.alertBox}>
              <div className={styles.alertTitle}>
                <TriangleAlert size={15} className="icono-inline" aria-hidden="true" />
                Alta deserción en {c.nombre}
              </div> 
              <div className={styles.alertDesc}>
                El <b>{pctLibre}%</b> de los inscriptos ({plural(c.libre, 'estudiante', 'estudiantes')}) quedaron libres o abandonaron.
              </div>
            </div>
          );
        })
      ) : (
        <p className={styles.noAlerts}>
          No hay alertas críticas para los filtros seleccionados.
        </p>
      )}
    </div>
  );
}

export default AlertsPanel;