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
export const formatearPeriodo = (label) => {
  if (!label) return '';
  const [anio, ...resto] = label.split(' - ');
  const nombre = resto.join(' - ').toLowerCase();
  return nombre ? `${anio} - ${nombre.charAt(0).toUpperCase()}${nombre.slice(1)}` : label;
};
