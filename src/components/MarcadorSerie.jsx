/*
 * Marca de una serie de datos que no depende del color: cada serie tiene un trazo (continuo, rayado,
 * punteado) y una forma de punto (círculo, cuadrado, triángulo, rombo). Así las series se distinguen
 * aunque no se vean los colores (daltonismo, impresión en blanco y negro).
 */

/* Forma de un punto dentro de un SVG. Los puntos huecos usan relleno del fondo y borde de color. */
export function Marcador({ forma, cx, cy, r = 4, fill, stroke, strokeWidth = 0, strokeDasharray }) {
  const comun = { fill, stroke, strokeWidth, strokeDasharray };
  switch (forma) {
    case 'cuadrado':
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} {...comun} />;
    case 'triangulo':
      return (
        <polygon
          points={`${cx},${cy - r * 1.2} ${cx + r * 1.15},${cy + r * 0.9} ${cx - r * 1.15},${cy + r * 0.9}`}
          {...comun}
        />
      );
    case 'rombo':
      return (
        <polygon
          points={`${cx},${cy - r * 1.35} ${cx + r * 1.35},${cy} ${cx},${cy + r * 1.35} ${cx - r * 1.35},${cy}`}
          {...comun}
        />
      );
    default:
      return <circle cx={cx} cy={cy} r={r} {...comun} />;
  }
}

/* Muestra de la serie (trazo y punto), para la leyenda y el globo de datos */
export function MuestraSerie({ serie }) {
  return (
    <svg width="34" height="12" viewBox="0 0 34 12" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <line
        x1="2" y1="6" x2="32" y2="6"
        stroke={serie.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={serie.trazo}
      />
      <Marcador forma={serie.forma} cx={17} cy={6} r={3.5} fill={serie.color} />
    </svg>
  );
}
