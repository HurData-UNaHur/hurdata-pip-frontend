/*
 * Comparación de dos períodos, por materia.
 */

const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : null);

/*
 * Une las materias de dos períodos (por código) y calcula el cambio del % de libres.
 *   materiasA / materiasB: listaMaterias de transformarDatosBackend (id = código de materia)
 *
 * Retorna una fila por materia:
 *   { id, nombre, inscriptosA, inscriptosB, libresA, libresB, cambio }
 *   cambio = puntos porcentuales (positivo = más libres que antes, empeoró).
 *   Si la materia no está en uno de los períodos, sus campos quedan en null.
 */
export function compararMaterias(materiasA, materiasB) {
  const filas = new Map();
  for (const [lado, lista] of [['a', materiasA], ['b', materiasB]]) {
    for (const m of lista) {
      const fila = filas.get(m.id) || { id: m.id, nombre: m.nombre, a: null, b: null };
      fila[lado] = { inscriptos: m.inscriptos, pctLibre: pct(m.libre, m.inscriptos) };
      fila.nombre = m.nombre; // el nombre más reciente gana
      filas.set(m.id, fila);
    }
  }
  return [...filas.values()].map(({ id, nombre, a, b }) => ({
    id,
    nombre,
    inscriptosA: a?.inscriptos ?? null,
    inscriptosB: b?.inscriptos ?? null,
    libresA: a?.pctLibre ?? null,
    libresB: b?.pctLibre ?? null,
    cambio: a?.pctLibre != null && b?.pctLibre != null ? b.pctLibre - a.pctLibre : null,
  }));
}
