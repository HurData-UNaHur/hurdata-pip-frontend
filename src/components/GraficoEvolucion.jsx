import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatearPeriodo, formatearPeriodoCorto } from '../utils/texto';

// Mismos colores que el resto de la app (KPIs y gráfico por comisión)
const SERIES = [
  { clave: 'pctPromo', nombre: 'Promoción', color: '#10b981' },
  { clave: 'pctReg', nombre: 'Regulares', color: '#3b82f6' },
  { clave: 'pctDesap', nombre: 'Desaprobados', color: '#f59e0b' },
  { clave: 'pctLibre', nombre: 'Libres', color: '#ef4444' },
];

// Recharts dibuja SVG: los colores de ejes y grilla se eligen según el tema
const COLORES_TEMA = {
  light: { texto: '#475569', grilla: '#e2e8f0', barra: '#cbd5e1', fondo: '#ffffff', borde: '#e2e8f0' },
  dark: { texto: '#94a3b8', grilla: '#334155', barra: '#475569', fondo: '#1e293b', borde: '#334155' },
};

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
      <span style={{ display: 'block' }}>{p.inscriptos} inscriptos · {p.comisiones} comisiones</span>
      {SERIES.map((s) => (
        <span key={s.clave} style={{ display: 'block', color: s.color }}>
          {s.nombre}: {p[s.clave]} %
        </span>
      ))}
    </div>
  );
}

/*
 * Evolución entre períodos: % por estado (líneas, eje izquierdo) e inscriptos
 * (barras grises, eje derecho).
 *
 *   puntos: [{ label, inscriptos, comisiones, pctPromo, pctReg, pctDesap, pctLibre }]
 *           del período más viejo al más nuevo
 *   theme:  'light' | 'dark'
 */
export default function GraficoEvolucion({ puntos, theme }) {
  const colores = COLORES_TEMA[theme] || COLORES_TEMA.light;
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={puntos} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={colores.grilla} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickFormatter={formatearPeriodoCorto}
            tick={{ fill: colores.texto, fontSize: 12 }}
            stroke={colores.grilla}
          />
          <YAxis
            yAxisId="pct"
            domain={[0, 100]}
            unit=" %"
            tick={{ fill: colores.texto, fontSize: 12 }}
            stroke={colores.grilla}
          />
          <YAxis
            yAxisId="inscriptos"
            orientation="right"
            allowDecimals={false}
            tick={{ fill: colores.texto, fontSize: 12 }}
            stroke={colores.grilla}
          />
          <Tooltip content={<TooltipEvolucion colores={colores} />} cursor={{ fill: colores.grilla, opacity: 0.4 }} />
          <Legend wrapperStyle={{ fontSize: '0.78rem', color: colores.texto }} />
          <Bar
            yAxisId="inscriptos"
            dataKey="inscriptos"
            name="Inscriptos"
            fill={colores.barra}
            barSize={28}
            radius={[4, 4, 0, 0]}
          />
          {SERIES.map((s) => (
            <Line
              key={s.clave}
              yAxisId="pct"
              type="monotone"
              dataKey={s.clave}
              name={s.nombre}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
