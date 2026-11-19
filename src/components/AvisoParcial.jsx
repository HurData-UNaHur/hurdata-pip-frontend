import { TriangleAlert } from 'lucide-react';
import styles from './AvisoParcial.module.css';
import { formatearPeriodo } from '../utils/texto';

/*
 * Aviso de que algún período tiene datos parciales (ej. un Excel con muy pocas comisiones).
 * Las variaciones contra ese período pueden no reflejar la realidad.
 *
 *   parciales: Map(label → { comisiones, tipico })  (utils/evolucion.js: periodosParciales)
 *   labels:    períodos que se están mostrando; solo se avisa de los que están en pantalla
 */
export default function AvisoParcial({ parciales, labels }) {
  const enPantalla = labels.filter((l) => parciales.has(l));
  if (enPantalla.length === 0) return null;

  return (
    <div className={styles.aviso} role="note">
      <TriangleAlert size={16} className={styles.icono} aria-hidden="true" />
      <div>
        {enPantalla.map((l) => {
          const { comisiones, tipico } = parciales.get(l);
          return (
            <p key={l}>
              <strong>{formatearPeriodo(l)}</strong> tiene datos parciales: {comisiones}{' '}
              {comisiones === 1 ? 'comisión' : 'comisiones'} frente a {tipico} en un período habitual.
              Las variaciones contra ese período pueden no ser reales.
            </p>
          );
        })}
      </div>
    </div>
  );
}
