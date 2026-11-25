/*
 * Trama de cada resultado en las barras apiladas y sus referencias, para que no dependan solo del color:
 *   promoción: lisa · regulares: diagonales · desaprobados: puntos · libres: rayas verticales
 * Se aplican como estilo en línea junto con `backgroundColor` (nunca con el atajo `background`, que las pisa).
 */
const CLARO = 'rgba(255, 255, 255, 0.4)';
const OSCURO = 'rgba(15, 23, 42, 0.4)';

export const PATRON_ESTADO = {
  promo: {},
  reg: {
    backgroundImage: `repeating-linear-gradient(45deg, ${CLARO} 0 2px, transparent 2px 6px)`,
  },
  desap: {
    backgroundImage: `radial-gradient(${OSCURO} 1.2px, transparent 1.6px)`,
    backgroundSize: '6px 6px',
  },
  libre: {
    backgroundImage: `repeating-linear-gradient(90deg, ${CLARO} 0 2px, transparent 2px 5px)`,
  },
};
