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
      <h2 className={styles.valor}>{valor}</h2>
      {subtitulo && <span className={styles.subtitulo}>{subtitulo}</span>}
    </div>
  );
}

export default KpiCard;