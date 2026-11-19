// Importamos el archivo CSS Module como un objeto llamado 'styles'
import styles from './KpiCard.module.css';

function KpiCard({ titulo, valor, subtitulo, colorBorde }) {
  return (
    <div
      className={styles.card}
      style={{
        borderTop: colorBorde ? `4px solid ${colorBorde}` : '1px solid #334155',
      }}
    >
      <span className={styles.titulo}>{titulo}</span>
      {/* El número toma el color del indicador (verde, azul, rojo); sin color, el verde UNaHur del CSS */}
      <h2 className={styles.valor} style={colorBorde ? { color: colorBorde } : undefined}>{valor}</h2>
      {subtitulo && <span className={styles.subtitulo}>{subtitulo}</span>}
    </div>
  );
}

export default KpiCard;