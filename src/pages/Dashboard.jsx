import { useState } from 'react';
import styles from './Dashboard.module.css';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import StackedBarChart from '../components/StackedBarChart';
import AlertsPanel from '../components/AlertsPanel';

function Dashboard({ 
  dataExcel, 
  listaMateriasExcel, 
  periodo, 
  setPeriodo, 
  listaPeriodos, 
  carrera, 
  setCarrera, 
  listaCarreras 
}) {
  // Sin datos cargados en la DB, todo queda vacío (sin mocks)
  const DATA = dataExcel || {};

  // Carrera activa: prioriza la prop `carrera` del estado global de App
  const carreraActiva = carrera || DATA.nombre_carrera || DATA.carrera || '';

  const listaClavesMaterias = Object.keys(DATA).filter(
    (k) => k !== 'nombre_carrera' && k !== 'carrera' && k !== 'codigo_carrera'
  );

  const listaMateriasFiltro = listaMateriasExcel || [];

  const [materiaSeleccionada, setMateria] = useState('');
  const [modalidad, setModalidad] = useState('todas');

  const materia = DATA[materiaSeleccionada]
    ? materiaSeleccionada
    : (listaClavesMaterias[0] || '');

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
        listaPeriodos={listaPeriodos}
        carrera={carreraActiva}
        setCarrera={setCarrera}
        listaCarreras={listaCarreras}
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
        </div>
      </main>
    </div>
  );
}

export default Dashboard;