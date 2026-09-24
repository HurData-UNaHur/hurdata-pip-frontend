import { useState } from 'react';
import KpiCard from '../components/KpiCard';

function Dashboard(){
    // Simulacion de unos datos
    const [metricas] = useState({
        totalInscriptos: 158,
        comisiones: 4,
        promocionados: { porcentaje: '52%', cantidad: 82},
        regulares: { porcentaje : '28%', cantidad: 44},
        libres: { porcentaje: '20%', cantidad: 32},
    });

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
            {/* Una Grid con las tarjetas KPI que se armo antes. */}
            <section style={{ display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',}}>
                <KpiCard
                    titulo="TOTAL INSCRIPTOS"
                    valor={metricas.totalInscriptos}
                    subtitulo={`${metricas.comisiones} comisiones activas`}
                />
                <KpiCard
                    titulo="PROMOCIONADOS"
                    valor={metricas.promocionados.porcentaje}
                    subtitulo={`${metricas.promocionados.cantidad} estudiantes`}
                    colorBorde="#10b981"
                />
                <KpiCard
                    titulo="REGULARES"
                    valor={metricas.regulares.porcentaje}
                    subtitulo={`${metricas.regulares.cantidad} estudiantes`}
                    colorBorde="#3b82f6"
                />
                <KpiCard
                    titulo="LIBRES / ABANDONO"
                    valor={metricas.libres.porcentaje}
                    subtitulo={`${metricas.libres.cantidad} estudiantes`}
                    colorBorde="#ef4444"
                />
            </section>
        </div>
    );
}

export default Dashboard;