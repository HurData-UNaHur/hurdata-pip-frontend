
import { useState } from 'react';
import styles from './Predicciones.module.css';
import KpiCard from '../components/KpiCard';

// Fallback estático con datos base por materia
const MATERIAS_DATOS_FALLBACK = [
  { id: 'ingles', nombre: 'Inglés I', libresActuales: 89, comisionesActuales: 4 },
  { id: 'objetos2', nombre: 'Programación de Objetos II', libresActuales: 9, comisionesActuales: 2 },
  { id: 'entornos', nombre: 'Nuevos Entornos y Lenguajes', libresActuales: 20, comisionesActuales: 1 },
  { id: 'base_datos', nombre: 'Bases de Datos I', libresActuales: 70, comisionesActuales: 3 }
];

function Predicciones({ listaMateriasExcel, materiaSeleccionada, setMateriaSeleccionada }) {
  const [tasaRecursado, setTasaRecursado] = useState(65);
  const [cupoPorAula, setCupoPorAula] = useState('35');

  // Selección de origen: Excel parseado o fallback
  const listaMaterias = (listaMateriasExcel && listaMateriasExcel.length > 0)
    ? listaMateriasExcel
    : MATERIAS_DATOS_FALLBACK;

  // Busca los datos de la materia seleccionada
  const materiaData = listaMaterias.find((m) => m.id === materiaSeleccionada) || listaMaterias[0];

  // Evitar divisiones por cero o valores nulos
  const cupoNumerico = Number(cupoPorAula);
  const cupoValido = cupoNumerico > 0 ? cupoNumerico : 1;

  const libresActuales = materiaData.libresActuales ?? materiaData.libre ?? 0;
  const comisionesActuales = materiaData.comisionesActuales ?? materiaData.comisiones ?? 1;

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
    // Límite de 5 dígitos como máximo
    if (val.length > 5) return;

    const num = parseInt(val, 10);
    setCupoPorAula(isNaN(num) ? '' : num.toString());
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Simulador de Vacantes y Planificación de Aulas</h1>
        <p className={styles.subtitle}>
          Proyección de recursantes y cálculo estimado de comisiones necesarias para el próximo período
        </p>
      </header>

      {/* Indicadores rápidos */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <KpiCard
          titulo="RECURSANTES ESPERADOS"
          valor={recursantesEstimados}
          subtitulo={`Sobre ${libresActuales} libres actuales`}
          colorBorde="#6366f1"
        />
        <KpiCard
          titulo="COMISIONES SUGERIDAS"
          valor={comisionesNecesarias}
          subtitulo={`Cupo estimado de ${cupoValido} alumnos/aula`}
        />
        <KpiCard
          titulo="AULAS ADICIONALES"
          valor={aulasExtra > 0 ? `+${aulasExtra}` : 'Sin extra'}
          subtitulo={aulasExtra > 0 ? 'Apertura recomendada' : 'Capacidad suficiente'}
          colorBorde={aulasExtra > 0 ? '#ef4444' : '#10b981'}
        />
      </section>

      {/* Panel del Simulador */}
      <div className={styles.simulatorGrid}>
        {/* Formulario de Parámetros */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Parámetros de Simulación</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>Seleccionar Materia</label>
            <select
              className={styles.select}
              value={materiaSeleccionada || materiaData.id}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
            >
              {listaMaterias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tasa estimada de re-inscripción: <strong>{tasaRecursado}%</strong>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={tasaRecursado}
              onChange={(e) => setTasaRecursado(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cupo máximo por comisión (alumnos)</label>
            <input
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
          <h2 className={styles.cardTitle}>Proyección para {materiaData.nombre}</h2>

          <div className={styles.resultsBox}>
            <div className={styles.resultItem}>
              <span>Estudiantes Libres del Período:</span>
              <span className={styles.resultValue}>{libresActuales}</span>
            </div>
            <div className={styles.resultItem}>
              <span>Recursantes Estimados ({tasaRecursado}%):</span>
              <span className={styles.resultValue}>{recursantesEstimados}</span>
            </div>
            <div className={styles.resultItem}>
              <span>Comisiones Actuales:</span>
              <span className={styles.resultValue}>{comisionesActuales}</span>
            </div>
            <div className={styles.resultItem}>
              <span>Comisiones Recomendadas:</span>
              <span className={`${styles.resultValue} ${styles.highlight}`}>
                {comisionesNecesarias}
              </span>
            </div>
            <div className={styles.resultItem}>
              <span>Aulas Nuevas a Asignar:</span>
              <span
                className={styles.resultValue}
                style={{ color: aulasExtra > 0 ? '#ef4444' : '#10b981' }}
              >
                {aulasExtra}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Predicciones;