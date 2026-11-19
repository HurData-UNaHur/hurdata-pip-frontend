import { useEffect, useState } from 'react';
import styles from './Evolucion.module.css';
import EstadoVacio from '../components/EstadoVacio';
import GraficoEvolucion from '../components/GraficoEvolucion';
import TablaComparativa from '../components/TablaComparativa';
import AvisoParcial from '../components/AvisoParcial';
import SelectorPeriodos from '../components/SelectorPeriodos';
import { compararMaterias } from '../utils/comparar';
import { getCarrerasTodas, getDatos, getEvolucion } from '../services/api';
import { transformarDatosBackend } from '../utils/transformData';
import { aPunto, periodosParciales, periodosPorDefecto } from '../utils/evolucion';
import { formatearPeriodo } from '../utils/texto';

const CUATRIMESTRES = [
  { value: 'todos', label: 'Todos los cuatrimestres' },
  { value: 'PRIMER', label: 'Solo primer cuatrimestre' },
  { value: 'SEGUNDO', label: 'Solo segundo cuatrimestre' },
];

// Respuesta vacía de /api/evolucion
const SIN_EVOLUCION = { materias: [], periodos: [] };

/*
 * Evolución entre períodos de una carrera:
 *   1. Gráfico de la carrera completa o de una materia (% por estado e inscriptos).
 *   2. Tabla comparativa de dos períodos, por materia (cambios de inscriptos y de libres).
 * Los períodos con datos parciales (muy pocas comisiones) se marcan y no se usan por defecto.
 * Público: lo ve también el modo invitado.
 */

function Evolucion({ estadoDatos, puedeCargar, onReintentar, carreraInicial, theme }) {
  const [carreras, setCarreras] = useState([]);
  const [carreraElegida, setCarreraElegida] = useState(''); // '' = todavía no eligió
  const [cuatrimestre, setCuatrimestre] = useState('todos');
  const [materia, setMateria] = useState('');               // '' = toda la carrera
  const [periodoAElegido, setPeriodoAElegido] = useState('');
  const [periodoBElegido, setPeriodoBElegido] = useState('');
  const [excluidos, setExcluidos] = useState([]);        // períodos destildados del gráfico
  const [error, setError] = useState(null);

  // Cada respuesta se guarda junto con la consulta que la pidió ('clave'):
  // si la clave no coincide con la consulta actual, esa parte está cargando.
  const [base, setBase] = useState({ clave: null, datos: SIN_EVOLUCION });
  const [deMateria, setDeMateria] = useState({ clave: null, periodos: [] });
  const [comparativa, setComparativa] = useState({ clave: null, filas: [] });

  // Carrera: la que eligió el usuario; si no, la activa del dashboard; si no, la primera
  const nombres = carreras.map((c) => c.nombre);
  const carrera = nombres.includes(carreraElegida) ? carreraElegida
    : nombres.includes(carreraInicial) ? carreraInicial : (nombres[0] || '');

  // 1. Carreras con datos (en cualquier período)
  useEffect(() => {
    if (estadoDatos !== 'ok') return undefined;
    let cancelado = false;
    getCarrerasTodas()
      .then((lista) => { if (!cancelado) setCarreras(lista); })
      .catch((err) => { if (!cancelado) setError(err.message); });
    return () => { cancelado = true; };
  }, [estadoDatos]);

  // 2. Base de la carrera: materias (para el selector) y todos sus períodos
  useEffect(() => {
    if (!carrera) return undefined;
    let cancelado = false;
    getEvolucion(carrera)
      .then((datos) => { if (!cancelado) { setBase({ clave: carrera, datos }); setError(null); } })
      .catch((err) => {
        if (!cancelado) { setBase({ clave: carrera, datos: SIN_EVOLUCION }); setError(err.message); }
      });
    return () => { cancelado = true; };
  }, [carrera]);

  // 3. Si se elige una materia, sus períodos
  const claveMateria = materia ? `${carrera}|${materia}` : null;
  useEffect(() => {
    if (!claveMateria) return undefined;
    let cancelado = false;
    getEvolucion(carrera, materia)
      .then((d) => { if (!cancelado) setDeMateria({ clave: claveMateria, periodos: d.periodos }); })
      .catch((err) => {
        if (!cancelado) { setDeMateria({ clave: claveMateria, periodos: [] }); setError(err.message); }
      });
    return () => { cancelado = true; };
  }, [claveMateria]); // eslint-disable-line react-hooks/exhaustive-deps

  const datosBase = base.clave === carrera ? base.datos : SIN_EVOLUCION;
  const cargandoGrafico = base.clave !== carrera || (claveMateria !== null && deMateria.clave !== claveMateria);

  const coincideCuatrimestre = (p) =>
    cuatrimestre === 'todos' || p.cuatrimestre.toUpperCase().startsWith(cuatrimestre);

  // Períodos con muy pocas comisiones frente al resto de la carrera (se calculan sobre todos, sin filtro)
  const parciales = periodosParciales(datosBase.periodos);

  const periodosGrafico = claveMateria ? deMateria.periodos : datosBase.periodos;
  const periodosElegibles = periodosGrafico.filter(coincideCuatrimestre);
  const puntos = periodosElegibles.filter((p) => !excluidos.includes(p.label)).map((p) => aPunto(p, parciales));

  // Comparativa: por defecto, los dos períodos más recientes que no sean parciales
  const labels = datosBase.periodos.filter(coincideCuatrimestre).map((p) => p.label);
  const [defectoA, defectoB] = periodosPorDefecto(labels, parciales);
  const periodoA = labels.includes(periodoAElegido) ? periodoAElegido : defectoA;
  const periodoB = labels.includes(periodoBElegido) ? periodoBElegido : defectoB;
  const claveComparativa = carrera && periodoA && periodoB && periodoA !== periodoB
    ? `${carrera}|${periodoA}|${periodoB}` : null;

  useEffect(() => {
    if (!claveComparativa) return undefined;
    let cancelado = false;
    Promise.all([getDatos(periodoA, carrera), getDatos(periodoB, carrera)])
      .then(([a, b]) => {
        if (cancelado) return;
        setComparativa({
          clave: claveComparativa,
          filas: compararMaterias(
            transformarDatosBackend(a).listaMaterias,
            transformarDatosBackend(b).listaMaterias,
          ),
        });
      })
      .catch((err) => {
        if (!cancelado) { setComparativa({ clave: claveComparativa, filas: [] }); setError(err.message); }
      });
    return () => { cancelado = true; };
  }, [claveComparativa]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargandoComparativa = comparativa.clave !== claveComparativa;
  const filasComparativa = cargandoComparativa ? [] : comparativa.filas;

  // Al cambiar de carrera se vuelve a "toda la carrera" y a los períodos por defecto
  const cambiarCarrera = (nueva) => {
    setCarreraElegida(nueva);
    setMateria('');
    setExcluidos([]);
    setPeriodoAElegido('');
    setPeriodoBElegido('');
  };

  const nombreMateria = datosBase.materias.find((m) => m.codigo === materia)?.nombre;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Evolución</h1>
        <p className={styles.subtitle}>
          Cómo cambian la promoción y los libres de una carrera o materia a lo largo de los períodos
        </p>
      </header>

      {estadoDatos !== 'ok' ? (
        <EstadoVacio estado={estadoDatos} puedeCargar={puedeCargar} onReintentar={onReintentar} />
      ) : (
        <>
          {/* ── Filtros generales ── */}
          <section className={styles.filtros}>
            <div className={styles.filtro}>
              <label htmlFor="evo-carrera">Carrera</label>
              <select id="evo-carrera" value={carrera} onChange={(e) => cambiarCarrera(e.target.value)}>
                {carreras.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div className={styles.filtro}>
              <label htmlFor="evo-cuatrimestre">Cuatrimestre</label>
              <select id="evo-cuatrimestre" value={cuatrimestre} onChange={(e) => setCuatrimestre(e.target.value)}>
                {CUATRIMESTRES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </section>

          {error && <p className={styles.error}>{error}</p>}

          {/* ── 1 y 2. Gráfico de evolución ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                {nombreMateria ? `Evolución de ${nombreMateria}` : 'Evolución de la carrera'}
              </h2>
              <div className={styles.filtroInline}>
                <label htmlFor="evo-materia">Materia</label>
                <select id="evo-materia" value={materia} onChange={(e) => setMateria(e.target.value)}>
                  <option value="">Toda la carrera</option>
                  {datosBase.materias.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
                </select>
              </div>
            </div>

            {!cargandoGrafico && (
              <SelectorPeriodos periodos={periodosElegibles} excluidos={excluidos} onChange={setExcluidos} />
            )}

            {cargandoGrafico ? (
              <div className={`skeleton ${styles.skGrafico}`} aria-label="Cargando gráfico" />
            ) : puntos.length === 0 ? (
              <p className={styles.aviso}>No hay períodos para mostrar. Revisá el cuatrimestre y los períodos tildados.</p>
            ) : (
              <>
                {puntos.length === 1 && (
                  <p className={styles.aviso}>
                    Hay un solo período cargado con este filtro. Cargá otro para ver la evolución.
                  </p>
                )}
                <AvisoParcial parciales={parciales} labels={puntos.map((p) => p.label)} />
                <GraficoEvolucion puntos={puntos} theme={theme} />
              </>
            )}
          </section>

          {/* ── 3. Comparativa entre dos períodos ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Comparar dos períodos</h2>
                <p className={styles.subtitle}>
                  Cambios de inscriptos y de libres por materia. Por defecto, primero lo que más empeoró.
                </p>
              </div>
              <div className={styles.comparar}>
                <select aria-label="Período A" value={periodoA} onChange={(e) => setPeriodoAElegido(e.target.value)}>
                  {labels.map((l) => <option key={l} value={l}>{formatearPeriodo(l)}</option>)}
                </select>
                <span aria-hidden="true">vs</span>
                <select aria-label="Período B" value={periodoB} onChange={(e) => setPeriodoBElegido(e.target.value)}>
                  {labels.map((l) => <option key={l} value={l}>{formatearPeriodo(l)}</option>)}
                </select>
              </div>
            </div>

            {labels.length < 2 ? (
              <p className={styles.aviso}>
                Hacen falta al menos dos períodos cargados de esta carrera para comparar.
              </p>
            ) : periodoA === periodoB ? (
              <p className={styles.aviso}>Elegí dos períodos distintos.</p>
            ) : cargandoComparativa ? (
              <div className={`skeleton ${styles.skTabla}`} aria-label="Cargando comparativa" />
            ) : (
              <>
                <AvisoParcial parciales={parciales} labels={[periodoA, periodoB]} />
                {filasComparativa.length > 0 && !filasComparativa.some((f) => f.cambio != null) && (
                  <p className={styles.aviso}>
                    Ninguna materia se repite entre los dos períodos (se comparan por código de
                    materia), así que no hay cambios para calcular.
                  </p>
                )}
                <TablaComparativa filas={filasComparativa} periodoA={periodoA} periodoB={periodoB} />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Evolucion;
