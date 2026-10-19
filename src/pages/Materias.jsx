import styles from './Materias.module.css';
import KpiCard from '../components/KpiCard';

// Mock con resumen por materia
const MATERIAS_MOCK = [
  { id: 'ingles', nombre: 'Inglés I', inscriptos: 218, promo: 95, reg: 28, libre: 89, comisiones: 4 },
  { id: 'objetos2', nombre: 'Programación de Objetos II', inscriptos: 60, promo: 30, reg: 17, libre: 9, comisiones: 2 },
  { id: 'entornos', nombre: 'Nuevos Entornos y Lenguajes', inscriptos: 55, promo: 12, reg: 15, libre: 20, comisiones: 1 },
  { id: 'base_datos', nombre: 'Bases de Datos I', inscriptos: 140, promo: 40, reg: 30, libre: 70, comisiones: 3 },
];

function Materias() {
  // Calculamos la materia con mayor porcentaje de deserción (materia filtro)
  const materiasProcesadas = MATERIAS_MOCK.map((m) => {
    const pctLibre = Math.round((m.libre / m.inscriptos) * 100);
    const pctPromo = Math.round((m.promo / m.inscriptos) * 100);
    return { ...m, pctLibre, pctPromo };
  });

  // Ordenamos de mayor a menor deserción para detectar cuellos de botella
  const rankingCritico = [...materiasProcesadas].sort((a, b) => b.pctLibre - a.pctLibre);
  const materiaMasCritica = rankingCritico[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Análisis Comparativo de Materias Filtro</h1>
        <p className={styles.subtitle}>
          Identificación de cuellos de botella académicos y materias con mayor tasa de deserción
        </p>
      </header>

      {/* Resumen en KPIs */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <KpiCard
          titulo="MATERIA MÁS CRÍTICA"
          valor={materiaMasCritica.nombre}
          subtitulo={`${materiaMasCritica.pctLibre}% de deserción`}
          colorBorde="#ef4444"
        />
        <KpiCard
          titulo="TOTAL MATERIAS EVALUADAS"
          valor={MATERIAS_MOCK.length}
          subtitulo="En el período actual"
        />
        <KpiCard
          titulo="PROMEDIO GENERAL LIBRES"
          valor={`${Math.round(
            materiasProcesadas.reduce((acc, m) => acc + m.pctLibre, 0) / materiasProcesadas.length
          )}%`}
          subtitulo="Tasa media de abandono"
          colorBorde="#3b82f6"
        />
      </section>

      {/* Tabla Comparativa de Materias */}
      <section className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Rendimiento por Materia</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Materia</th>
              <th>Comisiones</th>
              <th>Inscriptos</th>
              <th>Promoción (%)</th>
              <th>Libres / Abandono (%)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rankingCritico.map((m) => (
              <tr key={m.id}>
                <td><strong>{m.nombre}</strong></td>
                <td>{m.comisiones}</td>
                <td>{m.inscriptos}</td>
                <td style={{ color: '#10b981' }}>{m.pctPromo}% ({m.promo})</td>
                <td style={{ color: '#ef4444' }}>{m.pctLibre}% ({m.libre})</td>
                <td>
                  {m.pctLibre >= 35 ? (
                    <span className={styles.badgeCritico}>Materia Filtro</span>
                  ) : (
                    <span className={styles.badgeNormal}>Normal</span>
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