/*
 * Colores de las series de Evolución (promoción, libres, regulares, desaprobados).
 * Como líneas finas sobre la tarjeta tienen que llegar a 3:1 de contraste (WCAG 1.4.11),
 * y el mismo tono no alcanza en los dos temas: en claro se usa el tono 600/700, en oscuro el 500.
 * 'pastilla' es el color de relleno de la etiqueta con el valor, con texto oscuro encima.
 */
export const COLORES_SERIE = {
  promo: { light: '#059669', dark: '#10b981', pastilla: '#10b981' },
  libre: { light: '#dc2626', dark: '#ef4444', pastilla: '#ef4444' },
  reg: { light: '#2563eb', dark: '#3b82f6', pastilla: '#60a5fa' },
  desap: { light: '#b45309', dark: '#f59e0b', pastilla: '#f59e0b' },
};
export const colorSerie = (clave, theme) => COLORES_SERIE[clave][theme === 'dark' ? 'dark' : 'light'];
