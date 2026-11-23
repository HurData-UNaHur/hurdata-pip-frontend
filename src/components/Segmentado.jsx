import styles from './Segmentado.module.css';

/*
 * Control segmentado: un grupo de botones pegados donde uno solo está activo.
 *   opciones: [{ valor, texto, ayuda?, deshabilitada?, motivo? }]
 *   ayuda = tooltip con el nombre completo; motivo = tooltip que explica por qué no se puede elegir.
 * Una opción deshabilitada no se puede elegir, salvo que sea la que ya está activa. Se marca con
 * aria-disabled (y no con disabled) para que siga recibiendo foco y muestre su tooltip.
 */
export default function Segmentado({ etiqueta, opciones, valor, onChange }) {
  return (
    <div className={styles.segmentado} role="group" aria-label={etiqueta}>
      {opciones.map((o) => {
        const activa = o.valor === valor;
        const bloqueada = Boolean(o.deshabilitada) && !activa;
        return (
          <button
            key={o.valor}
            type="button"
            className={activa ? `${styles.boton} ${styles.activo}` : styles.boton}
            aria-pressed={activa}
            title={bloqueada ? (o.motivo ?? o.ayuda) : o.ayuda}
            aria-disabled={bloqueada || undefined}
            onClick={() => { if (!bloqueada) onChange(o.valor); }}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}
