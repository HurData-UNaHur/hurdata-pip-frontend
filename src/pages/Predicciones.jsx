import { useId, useState } from 'react';
import styles from './Predicciones.module.css';
import AyudaPantalla from '../components/AyudaPantalla';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import EstadoVacio from '../components/EstadoVacio';

function Predicciones({ 
  estadoDatos,
  puedeCargar,
  onReintentar,
  listaMateriasExcel, 
  materiaSeleccionada, 
  setMateriaSeleccionada, 
  periodo, 
  setPeriodo,
  listaPeriodos,
  carrera,
  setCarrera,
  listaCarreras
}) {
  const idCampos = useId();
  const [modalidad, setModalidad] = useState('todas');
  const [tasaRecursado, setTasaRecursado] = useState(65);
  const [cupoPorAula, setCupoPorAula] = useState('35');

  // Fuente de datos: lo cargado desde la DB (vacío si no hay datos)
  const listaMaterias = listaMateriasExcel || [];

  // Prioriza la prop carrera, luego la primera de listaCarreras
  const carreraActiva = carrera || (listaCarreras?.length > 0 ? listaCarreras[0].nombre : '');

  // Busca los datos de la materia seleccionada
  const materiaData = listaMaterias.find((m) => m.id === materiaSeleccionada) || listaMaterias[0];

  // Evitar divisiones por cero o valores nulos
  const cupoNumerico = Number(cupoPorAula);
  const cupoValido = cupoNumerico > 0 ? cupoNumerico : 1;

  const libresActuales = materiaData?.libresActuales ?? materiaData?.libre ?? 0;
  const comisionesActuales = materiaData?.comisionesActuales ?? materiaData?.comisiones ?? 0;

  // Cálculos proyectados
  const recursantesEstimados = Math.round(libresActuales * (tasaRecursado / 100));
  const comisionesNecesarias = Math.ceil(recursantesEstimados / cupoValido);
  const aulasExtra = Math.max(0, comisionesNecesarias - comisionesActuales);

  // Manejador del cupo con validaciones de longitud
  const handleCupoChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setCupoPorAula('');
      return;
    }
    if (val.length > 5) return;

    const num = parseInt(val, 10);
    setCupoPorAula(isNaN(num) ? '' : num.toString());
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Simulador de vacantes y planificación de aulas</h1>
        <p className={styles.subtitle}>
          Proyección de recursantes y cálculo estimado de comisiones necesarias para el próximo período
        </p>
      </header>

      {estadoDatos === 'ok' && <AyudaPantalla pantalla="predicciones" />}

      {estadoDatos !== 'ok' ? (
        <EstadoVacio estado={estadoDatos} puedeCargar={puedeCargar} onReintentar={onReintentar} />
      ) : (
      <>
      {/* Filtros idénticos a Dashboard */}
      <Filters 
        materia={materiaSeleccionada}
        setMateria={setMateriaSeleccionada}
        modalidad={modalidad}
        setModalidad={setModalidad}
        periodo={periodo}
        setPeriodo={setPeriodo}
        listaMaterias={listaMaterias}
        listaPeriodos={listaPeriodos}
        carrera={carreraActiva}
        setCarrera={setCarrera}
        listaCarreras={listaCarreras}
      />

      {/* Indicadores rápidos */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <KpiCard
          titulo="Recursantes esperados"
          ayuda="Alumnos libres de la materia por la tasa de recursado que elegiste: cuántos van a volver a cursarla."
          valor={recursantesEstimados}
          subtitulo={`Sobre ${libresActuales} libres actuales`}
          colorBorde="var(--c-indigo-500)"
        />
        <KpiCard
          titulo="Comisiones sugeridas"
          ayuda="Recursantes esperados divididos por el cupo por comisión, redondeado hacia arriba."
          valor={comisionesNecesarias}
          subtitulo={`Cupo estimado de ${cupoValido} alumnos/aula`}
        />
        <KpiCard
          titulo="Aulas adicionales"
          ayuda="Comisiones sugeridas menos las que tiene hoy la materia. Si da cero, la capacidad actual alcanza."
          valor={aulasExtra > 0 ? `+${aulasExtra}` : 'Sin extra'}
          subtitulo={aulasExtra > 0 ? 'Apertura recomendada' : 'Capacidad suficiente'}
          colorBorde={aulasExtra > 0 ? 'var(--c-red-500)' : 'var(--c-emerald-500)'}
        />
      </section>

      {/* Panel del Simulador */}
      <div className={styles.simulatorGrid}>
        {/* Formulario de Parámetros */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Parámetros de simulación</h2>

          <div className={styles.formGroup}>
            <label htmlFor={`${idCampos}-materia`} className={styles.label}>Seleccionar materia</label>
            <select
              id={`${idCampos}-materia`}
              className={styles.select}
              value={materiaData?.id || ''}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
            >
              {listaMaterias.length === 0 && <option value="">Sin materias cargadas</option>}
              {listaMaterias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${idCampos}-tasa`} className={styles.label}>
              Tasa estimada de re-inscripción: <strong>{tasaRecursado}%</strong>
            </label>
            <input
              id={`${idCampos}-tasa`}
              type="range"
              min="20"
              max="100"
              value={tasaRecursado}
              onChange={(e) => setTasaRecursado(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${idCampos}-cupo`} className={styles.label}>Cupo máximo por comisión (alumnos)</label>
            <input
              id={`${idCampos}-cupo`}
              type="number"
              min="1"
              max="99999"
              value={cupoPorAula}
              onChange={handleCupoChange}
              placeholder="Ej. 35"
              className={styles.input}
            />
          </div>
        </div>

        {/* Resumen del Estimador */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            {materiaData ? `Proyección para ${materiaData.nombre}` : 'Sin datos cargados'}
          </h2>

          <div className={styles.resultsBox}>
            <div className={styles.resultItem}>
              <span>Alumnos libres del período:</span>
              <span className={styles.resultValue}>{libresActuales}</span>
            </div>
            <div className={styles.resultItem}>
              <span>Recursantes Estimados ({tasaRecursado}%):</span>
              <span className={styles.resultValue}>{recursantesEstimados}</span>
            </div>
            <div className={styles.resultItem}>
              <span>Comisiones actuales:</span>
              <span className={styles.resultValue}>{comisionesActuales}</span>
            </div>
            <div className={styles.resultItem}>
              <span>Comisiones recomendadas:</span>
              <span className={`${styles.resultValue} ${styles.highlight}`}>
                {comisionesNecesarias}
              </span>
            </div>
            <div className={styles.resultItem}>
              <span>Aulas nuevas a asignar:</span>
              <span
                className={styles.resultValue}
                style={{ color: aulasExtra > 0 ? 'var(--c-red-500)' : 'var(--c-emerald-500)' }}
              >
                {aulasExtra}
              </span>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

export default Predicciones;