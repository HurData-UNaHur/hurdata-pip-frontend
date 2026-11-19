/*
 * Helpers de texto para la interfaz.
 */

/*
 * Cantidad con el sustantivo en singular o plural.
 *   plural(1, 'comisión', 'comisiones') → '1 comisión'
 *   plural(3, 'comisión', 'comisiones') → '3 comisiones'
 */
export const plural = (cantidad, singular, pluralTexto) =>
  `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;

/*
 * Label de período del backend en formato de lectura.
 *   formatearPeriodo('2023 - PRIMER CUATRIMESTRE') → '2023 - Primer cuatrimestre'
 */
/*
 * Número con separador de miles de Argentina.
 *   formatearNumero(7886) → '7.886'
 */
export const formatearNumero = (n) => Number(n).toLocaleString('es-AR');

/*
 * Label de período corto, para ejes de gráficos.
 *   formatearPeriodoCorto('2023 - PRIMER CUATRIMESTRE')  → '2023 · 1C'
 *   formatearPeriodoCorto('2023 - SEGUNDO CUATRIMESTRE') → '2023 · 2C'
 */
export const formatearPeriodoCorto = (label) => {
  if (!label) return '';
  const [anio, ...resto] = label.split(' - ');
  const nombre = resto.join(' - ').toUpperCase();
  if (nombre.startsWith('PRIMER')) return `${anio} · 1C`;
  if (nombre.startsWith('SEGUNDO')) return `${anio} · 2C`;
  return formatearPeriodo(label);
};

export const formatearPeriodo = (label) => {
  if (!label) return '';
  const [anio, ...resto] = label.split(' - ');
  const nombre = resto.join(' - ').toLowerCase();
  return nombre ? `${anio} - ${nombre.charAt(0).toUpperCase()}${nombre.slice(1)}` : label;
};

/*
 * Fecha ISO 8601 (UTC, como la guarda el backend) en hora local, formato corto
 * de 24 h para que entre en una línea.
 *   formatearFechaCorta('2026-11-18T22:14:05+00:00') → '18/11/26 19:14' (en Argentina)
 */
export const formatearFechaCorta = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)} ` +
    `${dos(d.getHours())}:${dos(d.getMinutes())}`;
};
