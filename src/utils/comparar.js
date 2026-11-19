/*
 * Comparación de dos períodos, por materia.
 */

const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : null);

// Resumen de una materia en un período: totales y distribución (en % que suma ~100)
function resumir(m) {
  const total = m.inscriptos;
  const desap = Math.max(0, total - m.promo - m.reg - m.libre);
  const p = (x) => pct(x, total) ?? 0;
  return {
    inscriptos: total,
    comisiones: m.comisiones,
    pctLibre: pct(m.libre, total),
    dist: { promo: p(m.promo), reg: p(m.reg), desap: p(desap), libre: p(m.libre) },
  };
}

/*
 * Une las materias de dos períodos (por código) y calcula los cambios.
 *   materiasA / materiasB: listaMaterias de transformarDatosBackend (id = código de materia)
 *
 * Retorna una fila por materia:
 *   id, nombre
 *   estado        'ambas' | 'nueva' (solo en B) | 'discontinuada' (solo en A)
 *   inscriptosA/B, libresA/B (% de libres), distA/B ({ promo, reg, desap, libre } en %)
 *   cambioInscr   variación de inscriptos en % (B contra A), null si falta alguno
 *   cambio        variación del % de libres en puntos porcentuales
 *                 (positivo = más libres que antes, empeoró), null si falta alguno
 */
export function compararMaterias(materiasA, materiasB) {
  const filas = new Map();
  for (const [lado, lista] of [['a', materiasA], ['b', materiasB]]) {
    for (const m of lista) {
      const fila = filas.get(m.id) || { id: m.id, nombre: m.nombre, a: null, b: null };
      fila[lado] = resumir(m);
      fila.nombre = m.nombre; // el nombre más reciente gana
      filas.set(m.id, fila);
    }
  }
  return [...filas.values()].map(({ id, nombre, a, b }) => ({
    id,
    nombre,
    estado: a && b ? 'ambas' : b ? 'nueva' : 'discontinuada',
    inscriptosA: a?.inscriptos ?? null,
    inscriptosB: b?.inscriptos ?? null,
    libresA: a?.pctLibre ?? null,
    libresB: b?.pctLibre ?? null,
    distA: a?.dist ?? null,
    distB: b?.dist ?? null,
    cambioInscr: a && b && a.inscriptos > 0 ? Math.round(((b.inscriptos - a.inscriptos) / a.inscriptos) * 100) : null,
    cambio: a?.pctLibre != null && b?.pctLibre != null ? b.pctLibre - a.pctLibre : null,
  }));
}
