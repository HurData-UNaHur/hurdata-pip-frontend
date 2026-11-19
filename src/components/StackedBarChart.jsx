import styles from './StackedBarChart.module.css';
import { plural } from '../utils/texto';

function StackedBarChart({ comisiones }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        <span>Rendimiento por Comisión</span>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ background: '#10b981' }}></i> Promocionados
          </span>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ background: '#3b82f6' }}></i> Regular
          </span>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ background: '#f59e0b' }}></i> Desaprobado
          </span>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ background: '#ef4444' }}></i> Libre
          </span>
        </div>
      </div>

      {comisiones.length === 0 && (
        <p style={{ textAlign: 'center', opacity: 0.7, margin: '16px 0' }}>
          No hay datos cargados para los filtros seleccionados.
        </p>
      )}

      {comisiones.map((c, index) => {
        const total = c.total || 1; // Evitar división por cero si una comisión viene vacía
        const numPromo = (c.promo / total) * 100;
        const numReg = (c.reg / total) * 100;
        const numDesap = (c.desap / total) * 100;
        const numLibre = (c.libre / total) * 100;

        const pctPromo = numPromo.toFixed(1); // Cantidad de decimales: 1
        const pctReg = numReg.toFixed(1);
        const pctDesap = numDesap.toFixed(1);
        const pctLibre = numLibre.toFixed(1);

        return (
          <div key={index} className={styles.comisionItem}>
            <div className={styles.comisionHeader}>
              <span>
                <strong>{c.nombre}</strong> ({plural(c.total, 'alumno', 'alumnos')})
              </span>
              <span>
                {pctPromo}% P / {pctReg}% R / {pctDesap}% D / {pctLibre}% L
              </span>
            </div>
            <div className={styles.stackedBar}>
              <div
                className={styles.barSeg}
                style={{ width: `${numPromo}%`, background: '#10b981' }}
                title={`Promo: ${c.promo} (${pctPromo}%)`}
              >
                {numPromo > 10 ? `${pctPromo}%` : ''}
              </div>
              <div
                className={styles.barSeg}
                style={{ width: `${numReg}%`, background: '#3b82f6' }}
                title={`Regulares: ${c.reg} (${pctReg}%)`}
              >
                {numReg > 10 ? `${pctReg}%` : ''}
              </div>
              <div
                className={styles.barSeg}
                style={{ width: `${numDesap}%`, background: '#f59e0b' }}
                title={`Desaprobados / Sin Condición: ${c.desap} (${pctDesap}%)`}
              >
                {numDesap > 10 ? `${pctDesap}%` : ''}
              </div>
              <div
                className={styles.barSeg}
                style={{ width: `${numLibre}%`, background: '#ef4444' }}
                title={`Libres: ${c.libre} (${pctLibre}%)`}
              >
                {numLibre > 10 ? `${pctLibre}%` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StackedBarChart;