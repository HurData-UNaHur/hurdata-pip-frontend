import { useState } from 'react';
import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import styles from './GraficoEvolucion.module.css';
import { ubicarEtiquetas, variacionReciente } from '../utils/evolucion';
import { formatearNumero, formatearPeriodo, formatearPeriodoCorto } from '../utils/texto';

// Mismos colores que el resto de la app (KPIs y gráfico por comisión).
// 'bueno' indica hacia dónde es buena la variación (los libres suben = malo).
const SERIES = [
  { clave: 'pctPromo', nombre: 'Promoción', color: '#10b981', relleno: true, bueno: 'sube' },
  { clave: 'pctLibre', nombre: 'Libres', color: '#ef4444', relleno: true, bueno: 'baja' },
  { clave: 'pctReg', nombre: 'Regulares', color: '#3b82f6', relleno: false },
  { clave: 'pctDesap', nombre: 'Desaprobados', color: '#f59e0b', relleno: false },
];
const SERIES_POR_DEFECTO = ['pctPromo'];

// Recharts dibuja SVG: los colores de ejes y grilla se eligen según el tema
// 'ambar' es el color del TEXTO de datos parciales: más oscuro en modo claro para que se lea sobre blanco
const COLORES_TEMA = {
  light: { texto: '#475569', grilla: '#e2e8f0', fondo: '#ffffff', borde: '#cbd5e1', ambar: '#b45309' },
  dark: { texto: '#94a3b8', grilla: '#334155', fondo: '#1e293b', borde: '#334155', ambar: '#f59e0b' },
};
const ALTO = 340;

// Eje X: período arriba e inscriptos abajo (el parcial va en ámbar y con asterisco)
function TickPeriodo({ x, y, payload, puntos, colores }) {
  const p = puntos.find((q) => q.label === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" dy={16} fill={colores.texto} fontSize={12} fontWeight={600}>
        {formatearPeriodoCorto(payload.value)}
      </text>
      {p && (
        <text textAnchor="middle" dy={32} fill={p.parcial ? colores.ambar : colores.texto} fontSize={11} opacity={0.95}>
          {formatearNumero(p.inscriptos)} insc.{p.parcial ? ' *' : ''}
        </text>
      )}
    </g>
  );
}

function TooltipEvolucion({ active, payload, colores }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      style={{
        background: colores.fondo, border: `1px solid ${colores.borde}`, borderRadius: 6,
        padding: '8px 10px', fontSize: '0.78rem', color: colores.texto,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>{formatearPeriodo(p.label)}</strong>
      <span style={{ display: 'block' }}>
        {formatearNumero(p.inscriptos)} inscriptos · {p.comisiones} {p.comisiones === 1 ? 'comisión' : 'comisiones'}
      </span>
      {p.parcial && <span style={{ display: 'block', color: colores.ambar }}>Datos parciales</span>}
      {SERIES.map((s) => (
        <span key={s.clave} style={{ display: 'block', color: s.color }}>
          {s.nombre}: {p[s.clave]} %
        </span>
      ))}
    </div>
  );
}

// Etiqueta con el valor, a la derecha del último punto COMPLETO de cada línea
const etiquetaFinal = (serie, puntos, dy, indiceFinal) => (props) => {
  if (props.index !== indiceFinal || props.x == null || props.y == null) return null;
  const ancho = 48;
  return (
    <g key={`fin-${serie.clave}`} transform={`translate(${props.x + 12}, ${props.y + (dy[serie.clave] || 0)})`}>
      <rect x={0} y={-10} width={ancho} height={20} rx={10} fill={serie.color} />
      <text x={ancho / 2} y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
        {puntos[indiceFinal][serie.clave]} %
      </text>
    </g>
  );
};

// Punto de la línea (períodos completos)
const puntoDe = (color) => (props) => {
  const { cx, cy, index } = props;
  if (cx == null || cy == null) return null;
  return <circle key={`p-${index}`} cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={2} />;
};

// Período parcial: punto hueco con borde punteado, suelto (la línea no pasa por él)
const puntoParcialDe = (color, colores) => (props) => {
  const { cx, cy, index } = props;
  if (cx == null || cy == null) return null;
  return <circle key={`h-${index}`} cx={cx} cy={cy} r={5} fill={colores.fondo} stroke={color} strokeWidth={2} strokeDasharray="2 2" />;
};

// Variación contra el período anterior: el color depende de si el cambio es bueno o malo
function Variacion({ delta, bueno, contra }) {
  if (delta === 0) {
    return <span className={styles.igual}><Minus size={13} className="icono-inline" aria-hidden="true" />igual que {contra}</span>;
  }
  const sube = delta > 0;
  const Icono = sube ? ArrowUp : ArrowDown;
  const esBueno = (bueno === 'sube') === sube;
  return (
    <span className={esBueno ? styles.buena : styles.mala}>
      <Icono size={13} className="icono-inline" aria-hidden="true" />
      {Math.abs(delta)} pp vs {contra}
    </span>
  );
}

/*
 * Evolución entre períodos: % de promoción y de libres (y, si se prenden, regulares y
 * desaprobados), con los inscriptos de cada período bajo el eje.
 *
 *   puntos: [{ label, inscriptos, comisiones, pctPromo, pctReg, pctDesap, pctLibre, parcial }]
 *           del período más viejo al más nuevo (utils/evolucion.js: aPunto)
 *   theme:  'light' | 'dark'
 */
export default function GraficoEvolucion({ puntos, theme }) {
  const colores = COLORES_TEMA[theme] || COLORES_TEMA.light;
  const [visibles, setVisibles] = useState(SERIES_POR_DEFECTO);

  const alternar = (clave) => setVisibles((prev) => {
    if (prev.includes(clave)) return prev.length > 1 ? prev.filter((c) => c !== clave) : prev; // siempre queda una
    return [...prev, clave];
  });

  const seriesVisibles = SERIES.filter((s) => visibles.includes(s.clave));

  // Las líneas unen solo los períodos completos. Los parciales van en series aparte, sin línea,
  // para que un Excel incompleto no dibuje una mejora o un empeoramiento que no existió.
  const datos = puntos.map((p) => {
    const fila = { ...p };
    for (const s of SERIES) {
      fila[`${s.clave}Linea`] = p.parcial ? null : p[s.clave];
      fila[`${s.clave}Parcial`] = p.parcial ? p[s.clave] : null;
    }
    return fila;
  });
  const indiceFinal = puntos.map((p) => p.parcial).lastIndexOf(false); // último período completo (-1 si no hay)
  const referencia = puntos[indiceFinal] ?? puntos[puntos.length - 1];
  const dy = ubicarEtiquetas(seriesVisibles.map((s) => ({ clave: s.clave, valor: referencia[s.clave] })));
  const variacion = variacionReciente(puntos);
  const hayParcial = puntos.some((p) => p.parcial);

  return (
    <div className={styles.contenedor}>
      {/* Resumen: último período completo contra el anterior completo */}
      {variacion && (
        <div className={styles.resumen}>
          {[SERIES[0], SERIES[1]].map((s) => (
            <div key={s.clave} className={styles.resumenItem} style={{ borderTopColor: s.color }}>
              <span className={styles.resumenTitulo}>{s.nombre} · {formatearPeriodoCorto(variacion.actual.label)}</span>
              <span className={styles.resumenValor} style={{ color: s.color }}>{variacion.actual[s.clave]} %</span>
              <Variacion
                delta={s.clave === 'pctPromo' ? variacion.deltaPromo : variacion.deltaLibre}
                bueno={s.bueno}
                contra={formatearPeriodoCorto(variacion.anterior.label)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Leyenda: cada serie se prende y se apaga con un clic */}
      <div className={styles.leyenda} role="group" aria-label="Series del gráfico">
        {SERIES.map((s) => {
          const activa = visibles.includes(s.clave);
          return (
            <button
              key={s.clave}
              type="button"
              aria-pressed={activa}
              className={`${styles.chip} ${activa ? '' : styles.chipOff}`}
              onClick={() => alternar(s.clave)}
            >
              <span className={styles.punto} style={{ background: s.color }} />
              {s.nombre}
            </button>
          );
        })}
      </div>

      <div style={{ width: '100%', height: ALTO }}>
        <ResponsiveContainer initialDimension={{ width: 820, height: ALTO }}>
          <ComposedChart data={datos} margin={{ top: 12, right: 64, bottom: 4, left: 0 }}>
            <defs>
              {SERIES.filter((s) => s.relleno).map((s) => (
                <linearGradient key={s.clave} id={`relleno-${s.clave}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={colores.grilla} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              height={50}
              padding={{ left: 36, right: 36 }}
              tick={<TickPeriodo puntos={puntos} colores={colores} />}
              stroke={colores.grilla}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v} %`}
              width={52}
              tick={{ fill: colores.texto, fontSize: 12 }}
              stroke={colores.grilla}
            />
            <Tooltip content={<TooltipEvolucion colores={colores} />} cursor={{ stroke: colores.texto, strokeDasharray: '3 3' }} />
            {seriesVisibles.map((s) => (
              <Area
                key={s.clave}
                type="monotone"
                dataKey={`${s.clave}Linea`}
                name={s.nombre}
                stroke={s.color}
                strokeWidth={2.5}
                fill={s.relleno ? `url(#relleno-${s.clave})` : 'none'}
                connectNulls
                dot={puntoDe(s.color)}
                activeDot={{ r: 6 }}
                label={etiquetaFinal(s, puntos, dy, indiceFinal)}
                isAnimationActive={false}
              />
            ))}
            {hayParcial && seriesVisibles.map((s) => (
              <Line
                key={`${s.clave}-parcial`}
                dataKey={`${s.clave}Parcial`}
                name={`${s.nombre} (parcial)`}
                stroke="none"
                dot={puntoParcialDe(s.color, colores)}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {hayParcial && (
        <p className={styles.nota}>
          <span className={styles.notaPunto} aria-hidden="true" />
          * Período con datos parciales: va como punto hueco y las líneas no pasan por él.
        </p>
      )}
    </div>
  );
}
