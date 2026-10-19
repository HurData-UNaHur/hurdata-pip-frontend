import { useState } from 'react';
import styles from './ProjectionSlider.module.css';

function ProjectionSlider({ totalLibres }) {
  const [tasa, setTasa] = useState(60);

  // Cálculos dinámicos
  const recursantes = Math.round(totalLibres * (tasa / 100));
  const comisionesSugeridas = Math.ceil(recursantes / 35);

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        <span>Proyección Próximo Cuatri</span>
      </div>
      <div className={styles.sliderBox}>
        <label className={styles.label}>
          Tasa estimada de recursado: <b>{tasa}%</b>
        </label>
        <input
          type="range"
          min="20"
          max="100"
          value={tasa}
          onChange={(e) => setTasa(Number(e.target.value))}
          className={styles.rangeInput}
        />
        <p className={styles.resultsText}>
          Recursantes esperados: <strong style={{ color: '#fff' }}>{recursantes}</strong>
          <br />
          Comisiones a abrir sugeridas:{' '}
          <strong style={{ color: '#6366f1' }}>
            {comisionesSugeridas} (cupo base 35)
          </strong>
        </p>
      </div>
    </div>
  );
}

export default ProjectionSlider;