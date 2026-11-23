import { useState } from 'react';
import styles from './Dashboard.module.css';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import StackedBarChart from '../components/StackedBarChart';
import AlertsPanel from '../components/AlertsPanel';
import EstadoVacio from '../components/EstadoVacio';
import OrigenDatos from '../components/OrigenDatos';
import { plural } from '../utils/texto';

function Dashboard({ 
  estadoDatos,
  puedeCargar,
  onReintentar,
  mostrarOrigen,
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
        <h1 className={styles.title}>Estadísticas generales</h1>
        <p className={styles.subtitle}>Panel de control académico y gestión de comisiones</p>
      </header>

      {estadoDatos !== 'ok' ? (
        <EstadoVacio estado={estadoDatos} puedeCargar={puedeCargar} onReintentar={onReintentar} />
      ) : (
      <>
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

      {/* De qué Excel salen los datos (solo usuarios logueados) */}
      {mostrarOrigen && <OrigenDatos periodo={periodo} carrera={carreraActiva} />}

      <section className={styles.kpiSection}>
        <KpiCard
          titulo="Total inscriptos"
          ayuda="Alumnos inscriptos en las comisiones del período, la carrera, la materia y la modalidad elegidos."
          valor={totalAlumnos}
          subtitulo={plural(comisiones.length, 'comisión', 'comisiones')}
        />
        <KpiCard
          titulo="Promocionados"
          ayuda="Alumnos que aprobaron la materia por promoción, sin necesidad de rendir final."
          valor={pctPromo}
          subtitulo={plural(totalPromo, 'alumno', 'alumnos')}
          colorBorde="var(--c-emerald-500)"
        />
        <KpiCard
          titulo="Regulares"
          ayuda="Alumnos que regularizaron la cursada pero todavía tienen que rendir el final."
          valor={pctReg}
          subtitulo={plural(totalReg, 'alumno', 'alumnos')}
          colorBorde="var(--c-blue-500)"
        />
        <KpiCard
          titulo="Libres / abandono"
          ayuda="Alumnos que quedaron libres: no cumplieron con la cursada. El reporte del SIU junta los abandonos y los desaprobados en esta categoría, así que no se pueden separar."
          valor={pctLibre}
          subtitulo={plural(totalLibre, 'alumno', 'alumnos')}
          colorBorde="var(--c-red-500)"
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
      </>
      )}
    </div>
  );
}

export default Dashboard;