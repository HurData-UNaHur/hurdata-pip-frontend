import { useState } from 'react';
import KpiCard from '../components/KpiCard';
import Filters from '../components/Filters';
import StackedBarChart from '../components/StackedBarChart';

// Mock representativo del SIU Guaraní (HTML original).
const DATA_MOCK = {
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


function Dashboard(){
    // Estados para controlar los filtros elegidos
  const [materia, setMateria] = useState('ingles');
  const [modalidad, setModalidad] = useState('todas');

  // Filtrado dinámico de comisiones
  let comisiones = DATA_MOCK[materia] || [];
  if (modalidad !== 'todas') {
    comisiones = comisiones.filter((c) => c.modalidad === modalidad);
  }

  // Cálculos dinámicos para los KPIs

  const totalAlumnos = comisiones.reduce((acc, c) => acc + c.total, 0);
  const totalPromo = comisiones.reduce((acc, c) => acc + c.promo, 0);
  const totalReg = comisiones.reduce((acc, c) => acc + c.reg, 0);
  const totalLibre = comisiones.reduce((acc, c) => acc + c.libre, 0);
  // El acc es un acumulador, no se me ocurrió otro nombre. Agarre la a de Alumnos y doble cc por las comisiones, la otra c que le sigue a la coma, es por comisión.

  const pctPromo = totalAlumnos ? `${Math.round((totalPromo / totalAlumnos) * 100)}%` : '0%';
  const pctReg = totalAlumnos ? `${Math.round((totalReg / totalAlumnos) * 100)}%` : '0%';
  const pctLibre = totalAlumnos ? `${Math.round((totalLibre / totalAlumnos) * 100)}%` : '0%';
  // pct es una abreviatura de Porcentaje.
    return(
        <div>
            <header style={{marginBottom: '24px'}}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold'}}>
                    Unahur * Estadísticas General.
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a2b8'}}>
                    Panel de control Académico y Gestión de Comisiones.
                </p>    
            </header>

            {/* La parte de Componente de Filtros */}
            <Filters>
                materia={materia}
                setMateria={setMateria}
                modalidad={modalidad}
                setModalidad={setModalidad}
            </Filters>


            {/* Una Grid con las tarjetas KPI que se armo antes. */}
            <section style={{ display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',}}>
                <KpiCard
                    titulo="TOTAL INSCRIPTOS"
                    valor={totalAlumnos}
                    subtitulo={`${comisiones.lenght} comisiones`}
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
            <main style={{ marginTop: '24px' }}>
                <StackedBarChart comisiones={comisiones} />
            </main>
        </div>
        
    );
}

export default Dashboard;