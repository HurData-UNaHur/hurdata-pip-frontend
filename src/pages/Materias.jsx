import { useState } from 'react';
import styles from './Materias.module.css';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import { formatearPeriodo } from '../utils/texto';

// Umbrales de % de libres: los usan la columna Indicador y el color de las tarjetas
const UMBRAL_RIESGO_ALTO = 70;
const UMBRAL_ATENCION = 45;

const COLOR_POR_NIVEL = {
  riesgo: '#ef4444',   // rojo
  atencion: '#f59e0b', // ámbar
  estable: '#22c55e',  // verde
};

const nivelPorLibres = (pctLibre) =>
  pctLibre >= UMBRAL_RIESGO_ALTO ? 'riesgo' : pctLibre >= UMBRAL_ATENCION ? 'atencion' : 'estable';

function Materias({ 
  listaMateriasExcel, 
  periodo, 
  setPeriodo, 
  listaPeriodos, 
  carrera, 
  setCarrera, 
  listaCarreras 
}) {
  const [materia, setMateria] = useState('');
  const [modalidad, setModalidad] = useState('todas');

  // Fuente de datos: lo cargado desde la DB (vacío si no hay datos)
  const materiasFuente = listaMateriasExcel || [];

  // Prioriza la prop carrera, luego la primera de listaCarreras
  const carreraActiva = carrera || (listaCarreras?.length > 0 ? listaCarreras[0].nombre : '');

  // Calculamos la materia con mayor porcentaje de deserción (materia filtro)
  const materiasProcesadas = materiasFuente.map((m) => {
    const total = m.inscriptos || 1;
    const pctLibre = Math.round((m.libre / total) * 100);
    const pctPromo = Math.round((m.promo / total) * 100);
    return { ...m, pctLibre, pctPromo };
  });

  // Ordenamos de mayor a menor deserción para detectar cuellos de botella
  const rankingCritico = [...materiasProcesadas].sort((a, b) => b.pctLibre - a.pctLibre);
  const materiaMasCritica = rankingCritico[0] || null;

  // Orden de la tabla: por defecto, mayor deserción primero (igual que antes).
  // Hacer clic en un encabezado ordena por esa columna; otro clic invierte el orden.
  // clave: columna clickeada; campo: valor por el que se ordena.
  // El indicador de cursada se calcula con el % de libres, así que ordena por ese valor.
  const COLUMNAS = [
    { clave: 'nombre', campo: 'nombre', titulo: 'Materia' },
    { clave: 'comisiones', campo: 'comisiones', titulo: 'Comisiones' },
    { clave: 'inscriptos', campo: 'inscriptos', titulo: 'Inscriptos' },
    // Sin "(%)" en el título: las celdas ya muestran "62% (54)"; la aclaración va en el tooltip
    { clave: 'promo', campo: 'pctPromo', titulo: 'Promoción', ayuda: '% sobre inscriptos (cantidad)' },
    { clave: 'libres', campo: 'pctLibre', titulo: 'Libres / Abandono', ayuda: '% sobre inscriptos (cantidad)' },
    {
      clave: 'indicador', campo: 'pctLibre', titulo: 'Indicador',
      ayuda: `Según el % de libres: Riesgo alto ≥ ${UMBRAL_RIESGO_ALTO} %, Atención ≥ ${UMBRAL_ATENCION} %`,
    },
  ];

  const [orden, setOrden] = useState({ clave: 'libres', direccion: 'desc' });

  const ordenarPor = (clave) => {
    setOrden((prev) =>
      prev.clave === clave
        ? { clave, direccion: prev.direccion === 'asc' ? 'desc' : 'asc' }
        // Columna nueva: texto de A a Z; números de mayor a menor
        : { clave, direccion: clave === 'nombre' ? 'asc' : 'desc' }
    );
  };

  const campoOrden = COLUMNAS.find((c) => c.clave === orden.clave).campo;
  const materiasOrdenadas = [...materiasProcesadas].sort((a, b) => {
    const cmp = campoOrden === 'nombre'
      ? a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      : (a[campoOrden] ?? 0) - (b[campoOrden] ?? 0);
    return orden.direccion === 'asc' ? cmp : -cmp;
  });

  // Promedio general del porcentaje de libres entre todas las materias
  const hayMaterias = materiasProcesadas.length > 0;
  const promedioLibres = hayMaterias
    ? Math.round(materiasProcesadas.reduce((acc, m) => acc + m.pctLibre, 0) / materiasProcesadas.length)
    : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Análisis Comparativo de Materias Filtro</h1>
        <p className={styles.subtitle}>
          Identificación de cuellos de botella académicos y materias con mayor tasa de deserción
        </p>
      </header>

      {/* Filtros idénticos a Dashboard */}
      <Filters 
        materia={materia}
        setMateria={setMateria}
        modalidad={modalidad}
        setModalidad={setModalidad}
        periodo={periodo}
        setPeriodo={setPeriodo}
        listaMaterias={materiasFuente}
        listaPeriodos={listaPeriodos}
        carrera={carreraActiva}
        setCarrera={setCarrera}
        listaCarreras={listaCarreras}
        showMateria={false}
        showModalidad={false}
      />

      {/* Resumen en KPIs */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <KpiCard
          titulo="TOTAL MATERIAS EVALUADAS"
          valor={materiasFuente.length}
          subtitulo={periodo ? formatearPeriodo(periodo) : 'Sin período seleccionado'}
        />
        <KpiCard
          titulo="PROMEDIO GENERAL LIBRES"
          valor={hayMaterias ? `${promedioLibres}%` : '—'}
          subtitulo="Tasa media de abandono"
          colorBorde={hayMaterias ? COLOR_POR_NIVEL[nivelPorLibres(promedioLibres)] : undefined}
        />
        <KpiCard
          titulo="MATERIA MÁS CRÍTICA"
          valor={materiaMasCritica ? `${materiaMasCritica.pctLibre}%` : '—'}
          subtitulo={materiaMasCritica ? materiaMasCritica.nombre : 'Sin datos'}
          subtituloCompleto={materiaMasCritica?.nombre}
          colorBorde={materiaMasCritica ? COLOR_POR_NIVEL[nivelPorLibres(materiaMasCritica.pctLibre)] : undefined}
        />
      </section>

      {/* Tabla Comparativa de Materias */}
      <section className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Rendimiento por Materia</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNAS.map((col) => {
                const activa = orden.clave === col.clave;
                return (
                  <th
                    key={col.clave}
                    aria-sort={activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      className={styles.sortBtn}
                      onClick={() => ordenarPor(col.clave)}
                      title={`Ordenar por ${col.titulo}${col.ayuda ? ` — ${col.ayuda}` : ''}`}
                    >
                      {col.titulo}
                      <span className={activa ? styles.sortIconActive : styles.sortIcon} aria-hidden="true">
                        {activa ? (orden.direccion === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {materiasOrdenadas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>
                  No hay datos cargados para el período y la carrera seleccionados.
                </td>
              </tr>
            )}
            {materiasOrdenadas.map((m) => (
              <tr key={m.id}>
                <td><strong>{m.nombre}</strong></td>
                <td>{m.comisiones}</td>
                <td>{m.inscriptos}</td>
                <td style={{ color: '#10b981' }}>{m.pctPromo}% ({m.promo})</td>
                <td style={{ color: '#ef4444' }}>{m.pctLibre}% ({m.libre})</td>
                <td>
                  {nivelPorLibres(m.pctLibre) === 'riesgo' ? (
                    <span className={styles.badgeCritico}>Riesgo alto</span>
                  ) : nivelPorLibres(m.pctLibre) === 'atencion' ? (
                    <span className={styles.badgeAtencion}>Atención</span>
                  ) : (
                    <span className={styles.badgeNormal}>Estable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Materias;