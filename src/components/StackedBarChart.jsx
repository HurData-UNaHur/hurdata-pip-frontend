// src/components/StackedBarChart.jsx
import styles from './StackedBarChart.module.css';

function StackedBarChart({ comisiones }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        <span>Rendimiento por Comisión</span>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ background: '#10b981' }}></i> Promocianados
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

      {comisiones.map((c, index) => {
        const pctPromo = ((c.promo / c.total) * 100).toFixed(1); // Cantidad de decimales: 1
        const pctReg = ((c.reg / c.total) * 100).toFixed(1);
        const pctDesap = ((c.desap / c.total) * 100).toFixed(1);
        const pctLibre = ((c.libre / c.total) * 100).toFixed(1);

        return (
          <div key={index} className={styles.comisionItem}>
            <div className={styles.comisionHeader}>
              <span>
                <strong>{c.nombre}</strong> ({c.total} alumnos)
              </span>
              <span style={{ color: '#94a3b8' }}>
                {pctPromo}% P / {pctReg}% R / {pctLibre}% L
              </span>
            </div>
            <div className={styles.stackedBar}>
              <div
                className={styles.barSeg}
                style={{ width: `${pctPromo}%`, background: '#10b981' }}
                title={`Promo: ${c.promo}`}
              >
                {pctPromo > 10 ? `${pctPromo}%` : ''}
              </div>
              <div
                className={styles.barSeg}
                style={{ width: `${pctReg}%`, background: '#3b82f6' }}
                title={`Regulares: ${c.reg}`}
              >
                {pctReg > 10 ? `${pctReg}%` : ''}
              </div>
              <div
                className={styles.barSeg}
                style={{ width: `${pctDesap}%`, background: '#f59e0b' }}
                title={`Desaprobados: ${c.desap}`}
              >
                {pctDesap > 10 ? `${pctDesap}%` : ''}
              </div>
              <div
                className={styles.barSeg}
                style={{ width: `${pctLibre}%`, background: '#ef4444' }}
                title={`Libres: ${c.libre}`}
              >
                {pctLibre > 10 ? `${pctLibre}%` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StackedBarChart;