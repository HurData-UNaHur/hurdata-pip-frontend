import styles from './SelectorPeriodos.module.css';

/*
 * Casillas para elegir qué períodos se dibujan en el gráfico, agrupadas por año.
 * `periodos`: [{ label, anio, cuatrimestre }]. `excluidos`: labels destildados.
 */
const nombreCuatri = (c) => (c.toUpperCase().startsWith('PRIMER') ? '1C' : '2C');

function SelectorPeriodos({ periodos, excluidos, onChange }) {
  if (periodos.length < 2) return null;

  const porAnio = new Map();
  periodos.forEach((p) => {
    if (!porAnio.has(p.anio)) porAnio.set(p.anio, []);
    porAnio.get(p.anio).push(p);
  });

  const alternar = (label) => {
    onChange(excluidos.includes(label)
      ? excluidos.filter((l) => l !== label)
      : [...excluidos, label]);
  };

  return (
    <fieldset className={styles.selector}>
      <legend className={styles.legend}>Períodos en el gráfico</legend>
      <div className={styles.grupos}>
        {[...porAnio.entries()].map(([anio, lista]) => (
          <div key={anio} className={styles.grupo}>
            <span className={styles.anio}>{anio}</span>
            {lista.map((p) => (
              <label key={p.label} className={styles.opcion}>
                <input
                  type="checkbox"
                  checked={!excluidos.includes(p.label)}
                  onChange={() => alternar(p.label)}
                />
                {nombreCuatri(p.cuatrimestre)}
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.acciones}>
        <button type="button" onClick={() => onChange([])}>Todos</button>
        <button type="button" onClick={() => onChange(periodos.map((p) => p.label))}>Ninguno</button>
      </div>
    </fieldset>
  );
}

export default SelectorPeriodos;
