import { Info } from 'lucide-react';
// Importamos el archivo CSS Module como un objeto llamado 'styles'
import styles from './KpiCard.module.css';
import Tooltip from './Tooltip';

// Verde UNaHur: acento de las tarjetas sin un color con significado propio
const COLOR_NEUTRO = 'var(--c-unahur)';

/*
 * Tarjeta de indicador. Un solo acento por tarjeta: el borde superior y el
 * número toman el mismo color (colorBorde, o el verde UNaHur si no se indica).
 *
 * ayuda: qué mide el indicador y cómo se calcula; sale en un globo desde el ícono de información.
 * subtituloCompleto: texto para el globo cuando el subtítulo puede quedar
 * cortado (se muestran como máximo 2 líneas).
 */
function KpiCard({ titulo, valor, subtitulo, subtituloCompleto, colorBorde, ayuda }) {
  const color = colorBorde || COLOR_NEUTRO;

  return (
    <div className={styles.card} style={{ borderTopColor: color }}>
      <span className={styles.titulo}>
        {titulo}
        {ayuda && (
          <Tooltip texto={ayuda}>
            <button type="button" className={styles.info} aria-label={`Qué significa: ${titulo}`}>
              <Info size={14} aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </span>
      <h2 className={styles.valor} style={{ color }}>{valor}</h2>
      {subtitulo && (
        <Tooltip texto={subtituloCompleto || undefined} enfocable>
          <span className={styles.subtitulo}>{subtitulo}</span>
        </Tooltip>
      )}
    </div>
  );
}

export default KpiCard;
