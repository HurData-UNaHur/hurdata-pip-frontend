/*
 * Umbrales de % de libres. Los usan la tabla de Materias, la comparación de períodos
 * y los colores de las tarjetas: se cambian acá y cambian en todos lados.
 */

export const UMBRAL_RIESGO_ALTO = 70;   // % de libres desde el cual una materia es "Riesgo alto"
export const UMBRAL_ATENCION = 45;      // % de libres desde el cual una materia pide "Atención"
export const UMBRAL_SALTO_LIBRES = 10;  // puntos porcentuales de aumento que se consideran un salto

export const COLOR_POR_NIVEL = {
  riesgo: '#ef4444',   // rojo
  atencion: '#f59e0b', // ámbar
  estable: '#22c55e',  // verde
};

export const nivelPorLibres = (pctLibre) =>
  pctLibre >= UMBRAL_RIESGO_ALTO ? 'riesgo' : pctLibre >= UMBRAL_ATENCION ? 'atencion' : 'estable';
