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
