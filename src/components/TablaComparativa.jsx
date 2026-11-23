import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Minus, Search, TriangleAlert } from 'lucide-react';
import styles from './TablaComparativa.module.css';
import BotonesExportar from './BotonesExportar';
import Tooltip from './Tooltip';
import Pp from './Pp';
import { slug } from '../utils/exportar';
import { formatearNumero, formatearPeriodoCorto, plural } from '../utils/texto';
import { UMBRAL_RIESGO_ALTO, UMBRAL_SALTO_LIBRES } from '../utils/umbrales';

// Mismos colores que el resto de la app
const SEGMENTOS = [
  { clave: 'promo', nombre: 'Promoción', color: '#10b981' },
  { clave: 'reg', nombre: 'Regulares', color: '#3b82f6' },
  { clave: 'desap', nombre: 'Desaprobados', color: '#f59e0b' },
  { clave: 'libre', nombre: 'Libres', color: '#ef4444' },
];

// Para buscar sin importar tildes ni mayúsculas
const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const num = (v, sufijo = '') => (v == null ? '—' : `${formatearNumero(v)}${sufijo}`);

/*
 * Cambio con flecha. El color depende de si el cambio es bueno o malo, no de si sube o baja:
 * más inscriptos es bueno (verde), más libres es malo (rojo).
 */
function Delta({ valor, unidad, subeEsBueno }) {
  if (valor == null) return null;
  if (valor === 0) return <span className={styles.igual}><Minus size={12} className="icono-inline" aria-hidden="true" />0{unidad}</span>;
  const sube = valor > 0;
  const Icono = sube ? ArrowUp : ArrowDown;
  return (
    <span className={`${styles.delta} ${sube === subeEsBueno ? styles.bueno : styles.malo}`}>
      <Icono size={12} className="icono-inline" aria-hidden="true" />
      {Math.abs(valor)}{unidad === ' pp' ? <>&nbsp;<Pp /></> : unidad}
    </span>
  );
}

// Barra apilada con la distribución de un período (promoción, regulares, desaprobados, libres)
function Barra({ dist, etiqueta }) {
  if (!dist) return <span className={styles.barraVacia} aria-hidden="true" />;
  const detalle = SEGMENTOS.map((s) => `${s.nombre} ${dist[s.clave]} %`).join(', ');
  return (
    <Tooltip texto={`${etiqueta}: ${detalle}`} enfocable>
      <span className={styles.barra} role="img" aria-label={`${etiqueta}: ${detalle}`}>
        {SEGMENTOS.map((s) => dist[s.clave] > 0 && (
          <span key={s.clave} style={{ flexGrow: dist[s.clave], background: s.color }} />
        ))}
      </span>
    </Tooltip>
  );
}

// Motivos por los que una materia merece atención
const motivosDe = (f) => {
  const motivos = [];
  if (f.libresB != null && f.libresB >= UMBRAL_RIESGO_ALTO) motivos.push(`Riesgo alto: ${f.libresB} % de libres`);
  if (f.cambio != null && f.cambio >= UMBRAL_SALTO_LIBRES) motivos.push(`Los libres subieron ${f.cambio} pp`);
  return motivos;
};

const valorDeOrden = (f, clave) => (clave === 'nombre' ? f.nombre : f[clave]);

/*
 * Tabla período A vs período B por materia, con buscador y orden por columna.
 * filas: resultado de compararMaterias (utils/comparar.js).
 * Por defecto: primero las materias cuyos libres más subieron.
 */
export default function TablaComparativa({ filas, periodoA, periodoB, carrera = '' }) {
  const etiquetaA = formatearPeriodoCorto(periodoA);
  const etiquetaB = formatearPeriodoCorto(periodoB);

  const [orden, setOrden] = useState({ clave: 'cambio', direccion: 'desc' });
  const [soloAmbas, setSoloAmbas] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const COLUMNAS = [
    { clave: 'nombre', titulo: 'Materia' },
    { clave: 'cambioInscr', titulo: 'Inscriptos', sub: `${etiquetaA} → ${etiquetaB}`, numerica: true,
      ayuda: 'Ordena por la variación en %' },
    { clave: 'cambio', titulo: 'Libres', sub: `${etiquetaA} → ${etiquetaB}`, numerica: true,
      ayuda: 'Ordena por la variación en puntos porcentuales' },
    { clave: null, titulo: 'Distribución', sub: 'A arriba, B abajo' },
    { clave: null, titulo: 'Alerta' },
  ];

  const ordenarPor = (clave) => setOrden((prev) => (
    prev.clave === clave
      ? { clave, direccion: prev.direccion === 'asc' ? 'desc' : 'asc' }
      : { clave, direccion: clave === 'nombre' ? 'asc' : 'desc' }
  ));

  const resumen = useMemo(() => ({
    ambas: filas.filter((f) => f.estado === 'ambas').length,
    nuevas: filas.filter((f) => f.estado === 'nueva').length,
    discontinuadas: filas.filter((f) => f.estado === 'discontinuada').length,
    empeoran: filas.filter((f) => f.cambio != null && f.cambio >= UMBRAL_SALTO_LIBRES).length,
    mejoran: filas.filter((f) => f.cambio != null && f.cambio <= -UMBRAL_SALTO_LIBRES).length,
  }), [filas]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    const filtradas = filas.filter((f) => (
      (!soloAmbas || f.estado === 'ambas')
      && (!q || normalizar(f.nombre).includes(q) || normalizar(f.id).includes(q))
    ));
    return filtradas.sort((x, y) => {
      const a = valorDeOrden(x, orden.clave);
      const b = valorDeOrden(y, orden.clave);
      // Sin dato siempre al final, sin importar la dirección
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      const cmp = orden.clave === 'nombre' ? a.localeCompare(b, 'es', { sensitivity: 'base' }) : a - b;
      return orden.direccion === 'asc' ? cmp : -cmp;
    });
  }, [filas, soloAmbas, busqueda, orden]);

  // Exporta lo que se ve: respeta el buscador, el filtro y el orden
  const ESTADOS = { ambas: 'En ambos períodos', nueva: 'Nueva', discontinuada: 'Dejó de dictarse' };
  const datosParaExportar = () => ({
    nombreArchivo: `comparativa-${slug(carrera)}-${slug(periodoA)}-vs-${slug(periodoB)}`,
    titulo: 'Comparación de períodos por materia',
    subtitulo: `${carrera} · ${etiquetaA} vs ${etiquetaB}`,
    columnas: [
      'Materia', 'Código', 'Situación',
      `Inscriptos ${etiquetaA}`, `Inscriptos ${etiquetaB}`, 'Var. inscriptos (%)',
      `Libres ${etiquetaA} (%)`, `Libres ${etiquetaB} (%)`, 'Var. libres (pp)', 'Alertas',
    ],
    filas: visibles.map((f) => [
      f.nombre, f.id, ESTADOS[f.estado],
      f.inscriptosA, f.inscriptosB, f.cambioInscr,
      f.libresA, f.libresB, f.cambio, motivosDe(f).join('. '),
    ]),
    horizontal: true,
  });

  return (
    <div className={styles.contenedor}>
      {/* Resumen de lo que cambió */}
      <div className={styles.resumen}>
        <span>{plural(resumen.ambas, 'materia', 'materias')} en ambos períodos</span>
        {resumen.empeoran > 0 && <span className={styles.malo}>{resumen.empeoran} con +{UMBRAL_SALTO_LIBRES} <Pp /> de libres o más</span>}
        {resumen.mejoran > 0 && <span className={styles.bueno}>{resumen.mejoran} con −{UMBRAL_SALTO_LIBRES} <Pp /> o menos</span>}
        {resumen.nuevas > 0 && <span>{plural(resumen.nuevas, 'nueva', 'nuevas')}</span>}
        {resumen.discontinuadas > 0 && (
          <span>{plural(resumen.discontinuadas, 'dejó de dictarse', 'dejaron de dictarse')}</span>
        )}
      </div>

      {/* Controles */}
      <div className={styles.controles}>
        <label className={styles.buscador}>
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar materia o código"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar materia o código"
          />
        </label>
        <label className={styles.switch}>
          <input type="checkbox" checked={soloAmbas} onChange={(e) => setSoloAmbas(e.target.checked)} />
          Solo materias dictadas en ambos períodos
        </label>
        <BotonesExportar obtener={datosParaExportar} deshabilitado={visibles.length === 0} />
      </div>

      {/* Referencias de la distribución */}
      <div className={styles.referencias} aria-hidden="true">
        {SEGMENTOS.map((s) => (
          <span key={s.clave}><i style={{ background: s.color }} />{s.nombre}</span>
        ))}
        <span className={styles.periodos}>A = {etiquetaA} · B = {etiquetaB}</span>
      </div>

      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              {COLUMNAS.map((col) => {
                const activa = col.clave !== null && orden.clave === col.clave;
                const contenido = (
                  <span className={styles.thTexto}>
                    {col.titulo}
                    {col.sub && <small>{col.sub}</small>}
                  </span>
                );
                return (
                  <th
                    key={col.titulo}
                    className={col.numerica ? styles.derecha : undefined}
                    aria-sort={activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.clave === null ? (
                      <div className={styles.thFijo}>{contenido}</div>
                    ) : (
                      <Tooltip texto={`Ordenar por ${col.titulo}${col.ayuda ? `. ${col.ayuda}` : ''}`}>
                        <button
                          type="button"
                          className={`${styles.sortBtn} ${col.numerica ? styles.sortBtnDerecha : ''}`}
                          onClick={() => ordenarPor(col.clave)}
                        >
                          {contenido}
                          <span className={activa ? styles.sortIconActive : styles.sortIcon} aria-hidden="true">
                            {activa ? (orden.direccion === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} />}
                          </span>
                        </button>
                      </Tooltip>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.vacio}>
                  {filas.length === 0 ? 'No hay materias para comparar.' : 'Ninguna materia coincide con el filtro.'}
                </td>
              </tr>
            )}
            {visibles.map((f) => {
              const motivos = motivosDe(f);
              const critico = f.libresB != null && f.libresB >= UMBRAL_RIESGO_ALTO;
              return (
                <tr key={f.id} className={f.estado === 'ambas' ? undefined : styles.filaSinPar}>
                  <td>
                    <strong>{f.nombre}</strong>
                    {f.estado === 'nueva' && <span className={styles.etiquetaNueva}>Nueva</span>}
                    {f.estado === 'discontinuada' && <span className={styles.etiquetaDisc}>Dejó de dictarse</span>}
                  </td>
                  <td className={styles.derecha}>
                    <span className={styles.valores}>{num(f.inscriptosA)} → {num(f.inscriptosB)}</span>
                    <Delta valor={f.cambioInscr} unidad=" %" subeEsBueno />
                  </td>
                  <td className={styles.derecha}>
                    <span className={styles.valores}>{num(f.libresA, ' %')} → {num(f.libresB, ' %')}</span>
                    <Delta valor={f.cambio} unidad=" pp" subeEsBueno={false} />
                  </td>
                  <td>
                    <span className={styles.barras}>
                      <span className={styles.filaBarra}><b>A</b><Barra dist={f.distA} etiqueta={`Período A (${etiquetaA})`} /></span>
                      <span className={styles.filaBarra}><b>B</b><Barra dist={f.distB} etiqueta={`Período B (${etiquetaB})`} /></span>
                    </span>
                  </td>
                  <td className={styles.centro}>
                    {motivos.length > 0 && (
                      <Tooltip texto={motivos.join('. ')} enfocable>
                        <span
                          className={critico ? styles.alertaCritica : styles.alerta}
                          role="img"
                          aria-label={motivos.join('. ')}
                        >
                          <TriangleAlert size={17} aria-hidden="true" />
                        </span>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
