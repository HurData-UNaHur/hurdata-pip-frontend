
import { useState } from 'react';
import styles from './Dashboard.module.css';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import StackedBarChart from '../components/StackedBarChart';
import AlertsPanel from '../components/AlertsPanel';
import ProjectionSlider from '../components/ProjectionSlider';

const DATA_MOCK_FALLBACK = {
  ingles: [
    { nombre: "(004)-COMISIÓN 1-COMBINADA", modalidad: "COMBINADA", total: 45, promo: 26, reg: 4, desap: 0, libre: 15 },
    { nombre: "(004)-COMISIÓN 15-VIRTUAL", modalidad: "VIRTUAL", total: 60, promo: 22, reg: 5, desap: 2, libre: 31 },
    { nombre: "(004)-COMISIÓN 20-VIRTUAL", modalidad: "VIRTUAL", total: 73, promo: 22, reg: 11, desap: 3, libre: 37 },
    { nombre: "(004)-COMISIÓN 7-PRESENCIAL", modalidad: "PRESENCIAL", total: 40, promo: 25, reg: 8, desap: 1, libre: 6 }
  ],
  objetos2: [
    { nombre: "(001)-COMISIÓN 1-COMBINADA", modalidad: "COMBINADA", total: 32, promo: 14, reg: 10, desap: 3, libre: 5 },
    { nombre: "(001)-COMISIÓN 2-PRESENCIAL", modalidad: "PRESENCIAL", total: 28, promo: 16, reg: 7, desap: 1, libre: 4 }
  ],
  entornos: [
    { nombre: "(008)-COMISIÓN 1-VIRTUAL", modalidad: "VIRTUAL", total: 55, promo: 12, reg: 15, desap: 8, libre: 20 }
  ]
};

// Lista predeterminada para mapear con el mock
const LISTA_MATERIAS_MOCK = [
  { id: 'ingles', nombre: 'Ingles I' },
  { id: 'objetos2', nombre: 'Programación de Objetos II' },
  { id: 'entornos', nombre: 'Nuevos Entornos y Lenguajes' }
];

function Dashboard({ dataExcel, listaMateriasExcel, periodo, setPeriodo}) {
  const tieneDatos = dataExcel && Object.keys(dataExcel).length > 0;
  const DATA = tieneDatos ? dataExcel : DATA_MOCK_FALLBACK;
  const listaClavesMaterias = Object.keys(DATA);

  // Si no hay datos dinámicos, pasamos la lista de respaldo
  const listaMateriasFiltro = (listaMateriasExcel && listaMateriasExcel.length > 0)
    ? listaMateriasExcel
    : LISTA_MATERIAS_MOCK;

  const [materiaSeleccionada, setMateria] = useState('');
  const [modalidad, setModalidad] = useState('todas');

  const materia = DATA[materiaSeleccionada]
    ? materiaSeleccionada
    : (listaClavesMaterias[0] || 'ingles');

  let comisiones = DATA[materia] || [];
  if (modalidad !== 'todas') {
    comisiones = comisiones.filter((c) => c.modalidad === modalidad);
  }

  const totalAlumnos = comisiones.reduce((acc, c) => acc + c.total, 0);
  const totalPromo = comisiones.reduce((acc, c) => acc + c.promo, 0);
  const totalReg = comisiones.reduce((acc, c) => acc + c.reg, 0);
  const totalLibre = comisiones.reduce((acc, c) => acc + c.libre, 0);

  const pctPromo = totalAlumnos ? `${Math.round((totalPromo / totalAlumnos) * 100)}%` : '0%';
  const pctReg = totalAlumnos ? `${Math.round((totalReg / totalAlumnos) * 100)}%` : '0%';
  const pctLibre = totalAlumnos ? `${Math.round((totalLibre / totalAlumnos) * 100)}%` : '0%';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Unahur * Estadísticas General.</h1>
        <p className={styles.subtitle}>Panel de control Académico y Gestión de Comisiones.</p>
      </header>

      <Filters
        materia={materia}
        setMateria={setMateria}
        modalidad={modalidad}
        setModalidad={setModalidad}
        periodo={periodo}
        setPeriodo={setPeriodo}
        listaMaterias={listaMateriasFiltro}
      />

      <section className={styles.kpiSection}>
        <KpiCard
          titulo="TOTAL INSCRIPTOS"
          valor={totalAlumnos}
          subtitulo={`${comisiones.length} comisiones`}
        />
        <KpiCard
          titulo="PROMOCIONADOS"
          valor={pctPromo}
          subtitulo={`${totalPromo} alumnos`}
          colorBorde="#10b981"
        />
        <KpiCard
          titulo="REGULARES"
          valor={pctReg}
          subtitulo={`${totalReg} alumnos`}
          colorBorde="#3b82f6"
        />
        <KpiCard
          titulo="LIBRES / ABANDONO"
          valor={pctLibre}
          subtitulo={`${totalLibre} alumnos`}
          colorBorde="#ef4444"
        />
      </section>

      <main className={styles.mainGrid}>
        <div>
          <StackedBarChart comisiones={comisiones} />
        </div>
        <div className={styles.sidebar}>
          <AlertsPanel comisiones={comisiones} />
          <ProjectionSlider totalLibres={totalLibre} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;