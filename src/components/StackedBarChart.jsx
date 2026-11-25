import styles from './StackedBarChart.module.css';
import Tooltip from './Tooltip';
import { PATRON_ESTADO } from '../utils/patronesEstado';
import { plural } from '../utils/texto';

function StackedBarChart({ comisiones }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        <span>Rendimiento por comisión</span>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ backgroundColor: 'var(--c-emerald-500)', ...PATRON_ESTADO.promo }}></i> Promocionados
          </span>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ backgroundColor: 'var(--c-blue-600)', ...PATRON_ESTADO.reg }}></i> Regular
          </span>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ backgroundColor: 'var(--c-amber-500)', ...PATRON_ESTADO.desap }}></i> Desaprobado
          </span>
          <span className={styles.legendItem}>
            <i className={styles.dot} style={{ backgroundColor: 'var(--c-red-600)', ...PATRON_ESTADO.libre }}></i> Libre
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
              <Tooltip texto={`Promo: ${c.promo} (${pctPromo}%)`} enfocable>
                <div className={styles.barSeg} role="img" aria-label={`Promo: ${c.promo} (${pctPromo}%)`} style={{ width: `${numPromo}%`, backgroundColor: 'var(--c-emerald-500)', color: 'var(--c-slate-900)', ...PATRON_ESTADO.promo }}>
                  {numPromo > 10 ? `${pctPromo}%` : ''}
                </div>
              </Tooltip>
              <Tooltip texto={`Regulares: ${c.reg} (${pctReg}%)`} enfocable>
                <div className={styles.barSeg} role="img" aria-label={`Regulares: ${c.reg} (${pctReg}%)`} style={{ width: `${numReg}%`, backgroundColor: 'var(--c-blue-600)', ...PATRON_ESTADO.reg }}>
                  {numReg > 10 ? `${pctReg}%` : ''}
                </div>
              </Tooltip>
              <Tooltip texto={`Desaprobados / Sin condición: ${c.desap} (${pctDesap}%)`} enfocable>
                <div className={styles.barSeg} role="img" aria-label={`Desaprobados / Sin condición: ${c.desap} (${pctDesap}%)`} style={{ width: `${numDesap}%`, backgroundColor: 'var(--c-amber-500)', color: 'var(--c-slate-900)', ...PATRON_ESTADO.desap }}>
                  {numDesap > 10 ? `${pctDesap}%` : ''}
                </div>
              </Tooltip>
              <Tooltip texto={`Libres: ${c.libre} (${pctLibre}%)`} enfocable>
                <div className={styles.barSeg} role="img" aria-label={`Libres: ${c.libre} (${pctLibre}%)`} style={{ width: `${numLibre}%`, backgroundColor: 'var(--c-red-600)', ...PATRON_ESTADO.libre }}>
                  {numLibre > 10 ? `${pctLibre}%` : ''}
                </div>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StackedBarChart;