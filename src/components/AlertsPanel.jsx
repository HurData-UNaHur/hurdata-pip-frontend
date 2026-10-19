import styles from './AlertsPanel.module.css';

function AlertsPanel({ comisiones }) {
  // Filtramos las comisiones con deserción >= 40%
  const alertas = comisiones.filter((c) => {
    const pctLibre = (c.libre / c.total) * 100;
    return pctLibre >= 40;
  });

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        <span>Alertas Académicas</span>
      </div>
      {/* Avisen del Emoji aca */}
      {alertas.length > 0 ? (
        alertas.map((c, index) => {
          const pctLibre = ((c.libre / c.total) * 100).toFixed(1);
          return (
            <div key={index} className={styles.alertBox}>
              <div className={styles.alertTitle}>
                ⚠️ Alta deserción en {c.nombre}     
              </div> 
              <div className={styles.alertDesc}>
                El <b>{pctLibre}%</b> de los inscriptos ({c.libre} estudiantes) quedaron libres o abandonaron.
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