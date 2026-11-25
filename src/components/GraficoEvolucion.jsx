import { useState } from 'react';
import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import styles from './GraficoEvolucion.module.css';
import Pp from './Pp';
import { Marcador, MuestraSerie } from './MarcadorSerie';
import { ubicarEtiquetas, variacionReciente } from '../utils/evolucion';
import { colorSerie, COLORES_SERIE } from '../utils/coloresSerie';
import { formatearNumero, formatearPeriodo, formatearPeriodoCorto } from '../utils/texto';

// Cada serie se distingue por color, trazo y forma de punto (no solo por el color).
// Mismos colores que el resto de la app (KPIs y gráfico por comisión).
// 'bueno' indica hacia dónde es buena la variación (los libres suben = malo).
const SERIES_BASE = [
  { clave: 'pctPromo', corta: 'promo', nombre: 'Promoción', pastilla: COLORES_SERIE.promo.pastilla, relleno: true, bueno: 'sube', trazo: undefined, forma: 'circulo' },
  { clave: 'pctLibre', corta: 'libre', nombre: 'Libres', pastilla: COLORES_SERIE.libre.pastilla, relleno: true, bueno: 'baja', trazo: '8 5', forma: 'cuadrado' },
  { clave: 'pctReg', corta: 'reg', nombre: 'Regulares', pastilla: COLORES_SERIE.reg.pastilla, relleno: false, trazo: '1 6', forma: 'triangulo' },
  { clave: 'pctDesap', corta: 'desap', nombre: 'Desaprobados', pastilla: COLORES_SERIE.desap.pastilla, relleno: false, trazo: '12 4 2 4', forma: 'rombo' },
];
const SERIES_POR_DEFECTO = ['pctPromo'];

// Recharts dibuja SVG: los colores de ejes y grilla se eligen según el tema
// 'ambar' es el color del TEXTO de datos parciales: más oscuro en modo claro para que se lea sobre blanco
const COLORES_TEMA = {
  light: { texto: '#475569', grilla: '#e2e8f0', fondo: '#ffffff', borde: '#cbd5e1', ambar: '#b45309' },
  dark: { texto: '#94a3b8', grilla: '#334155', fondo: '#1e293b', borde: '#334155', ambar: '#f59e0b' },
};
const ALTO = 340;
const ANCHO_CON_NOMBRES = 640; // por debajo, la etiqueta final muestra solo el valor

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

function TooltipEvolucion({ active, payload, colores, series }) {
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
      {series.map((s) => (
        <span key={s.clave} style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.color }}>
          <MuestraSerie serie={s} />
          {s.nombre}: {p[s.clave]} %
        </span>
      ))}
    </div>
  );
}

// Etiqueta con el valor, a la derecha del último punto COMPLETO de cada línea
const etiquetaFinal = (serie, puntos, dy, indiceFinal, conNombre) => (props) => {
  if (props.index !== indiceFinal || props.x == null || props.y == null) return null;
  // Con lugar suficiente la etiqueta lleva el nombre de la serie (etiquetado directo, sin ir a la leyenda)
  const texto = `${conNombre ? `${serie.nombre} ` : ''}${puntos[indiceFinal][serie.clave]} %`;
  const ancho = Math.round(texto.length * 6.4) + 18;
  return (
    <g key={`fin-${serie.clave}`} transform={`translate(${props.x + 12}, ${props.y + (dy[serie.clave] || 0)})`}>
      <rect x={0} y={-10} width={ancho} height={20} rx={10} fill={serie.pastilla} />
      <text x={ancho / 2} y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
        {texto}
      </text>
    </g>
  );
};

// Punto de la línea (períodos completos)
const puntoDe = (serie) => (props) => {
  const { cx, cy, index } = props;
  if (cx == null || cy == null) return null;
  return <Marcador key={`p-${index}`} forma={serie.forma} cx={cx} cy={cy} r={4.5} fill={serie.color} stroke={serie.color} strokeWidth={1.5} />;
};

// Período parcial: punto hueco con borde punteado, suelto (la línea no pasa por él)
const puntoParcialDe = (serie, colores) => (props) => {
  const { cx, cy, index } = props;
  if (cx == null || cy == null) return null;
  return <Marcador key={`h-${index}`} forma={serie.forma} cx={cx} cy={cy} r={5} fill={colores.fondo} stroke={serie.color} strokeWidth={2} strokeDasharray="2 2" />;
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
      {Math.abs(delta)}&nbsp;<Pp /> vs {contra}
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
  // Color de cada línea según el tema (ver utils/coloresSerie.js)
  const SERIES = SERIES_BASE.map((s) => ({ ...s, color: colorSerie(s.corta, theme) }));
  const [visibles, setVisibles] = useState(SERIES_POR_DEFECTO);
  const [anchoGrafico, setAnchoGrafico] = useState(820);
  const conNombres = anchoGrafico >= ANCHO_CON_NOMBRES;

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
              <MuestraSerie serie={s} />
              {s.nombre}
            </button>
          );
        })}
      </div>

      {/* El dibujo no se puede leer con lector de pantalla: sus datos van en la tabla de abajo */}
      <div style={{ width: '100%', height: ALTO }} aria-hidden="true">
        <ResponsiveContainer initialDimension={{ width: 820, height: ALTO }} onResize={(ancho) => setAnchoGrafico(ancho)}>
          <ComposedChart data={datos} margin={{ top: 12, right: conNombres ? 140 : 64, bottom: 4, left: 0 }}>
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
            <Tooltip content={<TooltipEvolucion colores={colores} series={SERIES} />} cursor={{ stroke: colores.texto, strokeDasharray: '3 3' }} />
            {seriesVisibles.map((s) => (
              <Area
                key={s.clave}
                type="monotone"
                dataKey={`${s.clave}Linea`}
                name={s.nombre}
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={s.trazo}
                fill={s.relleno ? `url(#relleno-${s.clave})` : 'none'}
                connectNulls
                dot={puntoDe(s)}
                activeDot={{ r: 6 }}
                label={etiquetaFinal(s, puntos, dy, indiceFinal, conNombres)}
                isAnimationActive={false}
              />
            ))}
            {hayParcial && seriesVisibles.map((s) => (
              <Line
                key={`${s.clave}-parcial`}
                dataKey={`${s.clave}Parcial`}
                name={`${s.nombre} (parcial)`}
                stroke="none"
                dot={puntoParcialDe(s, colores)}
                activeDot={false}
                legendType="none"
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Datos del gráfico: porcentaje de cada resultado por período</caption>
        <thead>
          <tr>
            <th scope="col">Período</th>
            <th scope="col">Inscriptos</th>
            <th scope="col">Promoción</th>
            <th scope="col">Libres</th>
            <th scope="col">Regulares</th>
            <th scope="col">Desaprobados</th>
          </tr>
        </thead>
        <tbody>
          {puntos.map((p) => (
            <tr key={p.label}>
              <th scope="row">{formatearPeriodo(p.label)}{p.parcial ? ' (datos parciales)' : ''}</th>
              <td>{formatearNumero(p.inscriptos)}</td>
              <td>{p.pctPromo} %</td>
              <td>{p.pctLibre} %</td>
              <td>{p.pctReg} %</td>
              <td>{p.pctDesap} %</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hayParcial && (
        <p className={styles.nota}>
          <span className={styles.notaPunto} aria-hidden="true" />
          * Período con datos parciales: va como punto hueco y las líneas no pasan por él.
        </p>
      )}
    </div>
  );
}
