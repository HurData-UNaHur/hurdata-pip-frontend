import Tooltip from './Tooltip';
import styles from './Pp.module.css';

/*
 * "pp" (puntos porcentuales) con su explicación en un globo. Es la diferencia entre dos
 * porcentajes, no un porcentaje de cambio: de 24% a 32% son 8 pp (y un 33% más en términos relativos).
 */
export default function Pp() {
  return (
    <Tooltip texto="pp = puntos porcentuales: la diferencia entre dos porcentajes. De 24% a 32% son 8 pp." enfocable>
      <abbr className={styles.sigla}>pp</abbr>
    </Tooltip>
  );
}
