// Importamos el archivo CSS Module como un objeto llamado 'styles'
import styles from './KpiCard.module.css';

// Verde UNaHur: acento de las tarjetas sin un color con significado propio
const COLOR_NEUTRO = '#007A33';

/*
 * Tarjeta de indicador. Un solo acento por tarjeta: el borde superior y el
 * número toman el mismo color (colorBorde, o el verde UNaHur si no se indica).
 *
 * subtituloCompleto: texto para el tooltip cuando el subtítulo puede quedar
 * cortado (se muestran como máximo 2 líneas).
 */
function KpiCard({ titulo, valor, subtitulo, subtituloCompleto, colorBorde }) {
  const color = colorBorde || COLOR_NEUTRO;
  return (
    <div className={styles.card} style={{ borderTopColor: color }}>
      <span className={styles.titulo}>{titulo}</span>
      <h2 className={styles.valor} style={{ color }}>{valor}</h2>
      {subtitulo && (
        <span className={styles.subtitulo} title={subtituloCompleto || undefined}>
          {subtitulo}
        </span>
      )}
    </div>
  );
}

export default KpiCard;
