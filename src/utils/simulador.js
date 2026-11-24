/*
 * Topes de seguridad del simulador de comisiones. Fuera de estos rangos el resultado deja de ser
 * razonable (un cupo de 1 alumno por comisión, por ejemplo, pide cientos de comisiones), así que el
 * cálculo siempre usa el valor acotado, aunque en el campo se haya escrito otro.
 */
export const TASA_MIN = 20;   // % de los libres que vuelve a cursar
export const TASA_MAX = 100;
export const CUPO_MIN = 10;   // alumnos por comisión
export const CUPO_MAX = 100;

export const acotar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));
