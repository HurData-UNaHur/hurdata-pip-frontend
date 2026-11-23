import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import styles from './Materias.module.css';
import AyudaPantalla from '../components/AyudaPantalla';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import EstadoVacio from '../components/EstadoVacio';
import BotonesExportar from '../components/BotonesExportar';
import Tooltip from '../components/Tooltip';
import { formatearPeriodo } from '../utils/texto';
import { slug } from '../utils/exportar';
// Los umbrales de % de libres (Indicador, colores de tarjetas, comparación de períodos) están en un solo lugar
import {
  COLOR_POR_NIVEL, UMBRAL_ATENCION, UMBRAL_RIESGO_ALTO, nivelPorLibres,
} from '../utils/umbrales';

function Materias({ 
  estadoDatos,
  puedeCargar,
  onReintentar,
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

  // Lo que se exporta: la tabla tal como está ordenada en pantalla
  const etiquetaIndicador = (pctLibre) => {
    const nivel = nivelPorLibres(pctLibre);
    return nivel === 'riesgo' ? 'Riesgo alto' : nivel === 'atencion' ? 'Atención' : 'Estable';
  };
  const datosParaExportar = () => ({
    nombreArchivo: `materias-${slug(carreraActiva)}-${slug(periodo)}`,
    titulo: 'Rendimiento por materia',
    subtitulo: `${carreraActiva} · ${periodo ? formatearPeriodo(periodo) : ''}`,
    columnas: [
      'Materia', 'Código', 'Comisiones', 'Inscriptos',
      'Promoción (%)', 'Promoción (alumnos)', 'Libres (%)', 'Libres (alumnos)', 'Indicador',
    ],
    filas: materiasOrdenadas.map((m) => [
      m.nombre, m.id, m.comisiones, m.inscriptos,
      m.pctPromo, m.promo, m.pctLibre, m.libre, etiquetaIndicador(m.pctLibre),
    ]),
    horizontal: true,
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Análisis Comparativo de Materias Filtro</h1>
        <p className={styles.subtitle}>
          Identificación de cuellos de botella académicos y materias con mayor tasa de deserción
        </p>
      </header>

      {estadoDatos === 'ok' && <AyudaPantalla pantalla="materias" />}

      {estadoDatos !== 'ok' ? (
        <EstadoVacio estado={estadoDatos} puedeCargar={puedeCargar} onReintentar={onReintentar} />
      ) : (
      <>
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
          titulo="Total materias evaluadas"
          ayuda="Materias con comisiones en el período y la carrera elegidos."
          valor={materiasFuente.length}
          subtitulo={periodo ? formatearPeriodo(periodo) : 'Sin período seleccionado'}
        />
        <KpiCard
          titulo="Promedio general libres"
          ayuda="Promedio simple del porcentaje de libres de cada materia: todas pesan igual, tengan pocos o muchos alumnos."
          valor={hayMaterias ? `${promedioLibres}%` : '—'}
          subtitulo="Tasa media de abandono"
          colorBorde={hayMaterias ? COLOR_POR_NIVEL[nivelPorLibres(promedioLibres)] : undefined}
        />
        <KpiCard
          titulo="Materia más crítica"
          ayuda="La materia con mayor porcentaje de libres en el período elegido."
          valor={materiaMasCritica ? `${materiaMasCritica.pctLibre}%` : '—'}
          subtitulo={materiaMasCritica ? materiaMasCritica.nombre : 'Sin datos'}
          subtituloCompleto={materiaMasCritica?.nombre}
          colorBorde={materiaMasCritica ? COLOR_POR_NIVEL[nivelPorLibres(materiaMasCritica.pctLibre)] : undefined}
        />
      </section>

      {/* Tabla Comparativa de Materias */}
      <section className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Rendimiento por Materia</h2>
          <BotonesExportar obtener={datosParaExportar} deshabilitado={materiasOrdenadas.length === 0} />
        </div>
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
                    <Tooltip texto={`Ordenar por ${col.titulo}${col.ayuda ? `. ${col.ayuda}` : ''}`}>
                      <button
                        type="button"
                        className={styles.sortBtn}
                        onClick={() => ordenarPor(col.clave)}
                      >
                        {col.titulo}
                        <span className={activa ? styles.sortIconActive : styles.sortIcon} aria-hidden="true">
                          {activa ? (orden.direccion === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} />}
                        </span>
                      </button>
                    </Tooltip>
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
                <td style={{ color: 'var(--c-emerald-500)' }}>{m.pctPromo}% ({m.promo})</td>
                <td style={{ color: 'var(--c-red-500)' }}>{m.pctLibre}% ({m.libre})</td>
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
      </>
      )}
    </div>
  );
}

export default Materias;