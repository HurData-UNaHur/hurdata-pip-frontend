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
 * Rango de períodos que muestra el gráfico.
 *   modo 'todo'          → todos los períodos
 *   modo 'ultimos3'      → los últimos 3 años que tengan datos
 *   modo 'ultimo'        → el último año que tenga datos
 *   modo 'personalizado' → de `desde` a `hasta` (labels), en cualquier orden
 *   periodos: del más viejo al más nuevo, con { label, anio }
 * El filtro de cuatrimestre se aplica después, sobre este resultado.
 */
const MAX_PERIODOS_POR_DEFECTO = 8;

// Con pocos períodos se muestra todo; con muchos, solo los años más recientes
export const modoPorDefecto = (cantidad) => (cantidad <= MAX_PERIODOS_POR_DEFECTO ? 'todo' : 'ultimos3');

export function ventanaDePeriodos(periodos, { modo, desde, hasta }) {
  if (modo === 'personalizado') {
    const i = periodos.findIndex((p) => p.label === desde);
    const j = periodos.findIndex((p) => p.label === hasta);
    if (i < 0 || j < 0) return periodos;
    return periodos.slice(Math.min(i, j), Math.max(i, j) + 1);
  }
  const cantidadAnios = { ultimo: 1, ultimos3: 3 }[modo] ?? Infinity;
  const anios = new Set([...new Set(periodos.map((p) => p.anio))].slice(-cantidadAnios));
  return periodos.filter((p) => anios.has(p.anio));
}

// cuatrimestre: 'todos' | 'PRIMER' | 'SEGUNDO'
export const esDeCuatrimestre = (p, cuatrimestre) =>
  cuatrimestre === 'todos' || p.cuatrimestre.toUpperCase().startsWith(cuatrimestre);

/*
 * Cuando se elige un cuatrimestre, las listas "Desde / Hasta" solo ofrecen períodos de ese
 * cuatrimestre. Si el extremo elegido ya no está en la lista, se corre al período más cercano
 * que sí está, hacia adentro del rango, para que el rango nunca quede vacío ni invertido.
 */
export function ajustarAlCuatrimestre(periodos, { desde, hasta }, cuatrimestre) {
  const pos = (label) => periodos.findIndex((p) => p.label === label);
  const lista = periodos.filter((p) => esDeCuatrimestre(p, cuatrimestre));
  if (lista.length === 0) return { desde, hasta };
  const nuevoDesde = lista.find((p) => pos(p.label) >= pos(desde)) ?? lista[lista.length - 1];
  const nuevoHasta = [...lista].reverse().find((p) => pos(p.label) <= pos(hasta)) ?? lista[0];
  return pos(nuevoHasta.label) < pos(nuevoDesde.label)
    ? { desde: nuevoDesde.label, hasta: nuevoDesde.label }
    : { desde: nuevoDesde.label, hasta: nuevoHasta.label };
}

/*
 * Mantiene "Desde" y "Hasta" en orden: si se elige un extremo que pasa al otro,
 * el otro se mueve al mismo período en lugar de dejar un rango invertido.
 *   cambio: { desde } o { hasta }
 */
export function ajustarRango(periodos, rango, cambio) {
  const pos = (label) => periodos.findIndex((p) => p.label === label);
  let { desde, hasta } = { ...rango, ...cambio };
  if (cambio.desde !== undefined && pos(desde) > pos(hasta)) hasta = desde;
  if (cambio.hasta !== undefined && pos(hasta) < pos(desde)) desde = hasta;
  return { desde, hasta };
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
