/*
 * Funciones puras de la página Evolución (sin React), para poder probarlas solas.
 */
import { sumarEstados } from './transformData.js';

const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);

// Un período es "parcial" si tiene menos de la mitad de las comisiones que es habitual en la carrera
const FRACCION_PARCIAL = 0.5;

/*
 * Detecta períodos con datos parciales (ej. un Excel con 5 comisiones cuando los demás tienen 113).
 * Comparar contra ellos da variaciones falsas, así que la página los marca.
 *
 *   periodos: [{ label, comisiones }]  (todos los de la carrera, sin filtrar)
 *   → Map(label → { comisiones, tipico })   tipico = mediana de comisiones de los períodos
 */
export function periodosParciales(periodos) {
  const parciales = new Map();
  if (periodos.length < 2) return parciales;
  const orden = periodos.map((p) => p.comisiones).sort((a, b) => a - b);
  const medio = Math.floor(orden.length / 2);
  const tipico = orden.length % 2 ? orden[medio] : Math.round((orden[medio - 1] + orden[medio]) / 2);
  for (const p of periodos) {
    if (p.comisiones < tipico * FRACCION_PARCIAL) parciales.set(p.label, { comisiones: p.comisiones, tipico });
  }
  return parciales;
}

/*
 * Período del backend → punto del gráfico (misma regla de estados que el resto de la app).
 */
export function aPunto(p, parciales = new Map()) {
  const { promo, reg, libre, desap, total } = sumarEstados(p.estados);
  return {
    label: p.label,
    comisiones: p.comisiones,
    inscriptos: total,
    pctPromo: pct(promo, total),
    pctReg: pct(reg, total),
    pctDesap: pct(desap, total),
    pctLibre: pct(libre, total),
    parcial: parciales.has(p.label),
  };
}

/*
 * Los dos períodos a comparar por defecto: los dos más recientes que NO son parciales.
 * Si no hay dos completos, los dos más recientes sin más.
 *   labels: del más viejo al más nuevo
 */
export function periodosPorDefecto(labels, parciales) {
  const completos = labels.filter((l) => !parciales.has(l));
  const fuente = completos.length >= 2 ? completos : labels;
  return [fuente[fuente.length - 2] || '', fuente[fuente.length - 1] || ''];
}

/*
 * Cambio del último período completo contra el anterior completo (para el resumen del gráfico).
 *   → { actual, anterior, deltaPromo, deltaLibre } | null si no hay dos períodos completos
 */
export function variacionReciente(puntos) {
  const completos = puntos.filter((p) => !p.parcial);
  if (completos.length < 2) return null;
  const actual = completos[completos.length - 1];
  const anterior = completos[completos.length - 2];
  return {
    actual,
    anterior,
    deltaPromo: actual.pctPromo - anterior.pctPromo,
    deltaLibre: actual.pctLibre - anterior.pctLibre,
  };
}

/*
 * Evita que las etiquetas del final de cada línea se pisen cuando los valores son parecidos.
 *   items: [{ clave, valor }]  (valor = % del último punto)
 *   → { [clave]: desplazamiento vertical en píxeles (positivo = hacia abajo) }
 */
export function ubicarEtiquetas(items, separacion = 7, pxPorPunto = 2.3) {
  const orden = [...items].sort((a, b) => b.valor - a.valor);
  const dy = {};
  let anterior = null;
  for (const it of orden) {
    const ajustado = anterior !== null && anterior - it.valor < separacion ? anterior - separacion : it.valor;
    dy[it.clave] = (it.valor - ajustado) * pxPorPunto;
    anterior = ajustado;
  }
  return dy;
}
