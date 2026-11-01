import styles from './Filters.module.css';

function Filters({ 
    materia, 
    setMateria, 
    modalidad, 
    setModalidad, 
    periodo, 
    setPeriodo, 
    listaMaterias = [],
    listaPeriodos = [],
    carrera,
    setCarrera,
    listaCarreras = [],
    showMateria = true,
    showModalidad = true
}) {
    // Si hay lista de carreras la usamos; si no, aseguramos el fallback a la prop activa o Licenciatura en Informática
    const carrerasAMostrar = (listaCarreras && listaCarreras.length > 0)
        ? listaCarreras 
        : [{ id: 'fallback', nombre: 'Licenciatura en Informática' }];

    // Valor seleccionado garantizado: prioriza la prop directa 'carrera' sobre el primer item del arreglo
    const valorCarreraSeleccionada = carrera 
        ? carrera 
        : (carrerasAMostrar[0] ? carrerasAMostrar[0].nombre : 'Licenciatura en Informática');

    return (
        <section className={styles.filtersContainer}>
            {/* Período */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Período</label>
                <select 
                    className={styles.select} 
                    value={periodo} 
                    onChange={(e) => setPeriodo(e.target.value)}
                >
                    {listaPeriodos && listaPeriodos.length > 0 ? (
                        listaPeriodos.map((p) => (
                            <option key={p.id_periodo || p.label} value={p.label}>
                                {p.label}
                            </option>
                        ))
                    ) : (
                        <option value="">Cargando períodos...</option>
                    )}
                </select>
            </div>

            {/* Carrera Dinámica */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Carrera</label>
                <select 
                    className={styles.select} 
                    value={valorCarreraSeleccionada} 
                    onChange={(e) => setCarrera && setCarrera(e.target.value)}
                >
                    {carrerasAMostrar.map((c) => (
                        <option key={c.id || c.nombre} value={c.nombre}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Materia */}
            {showMateria && (
            <div className={styles.filterGroup}>
                <label className={styles.label}>Materia</label>
                <select 
                    className={styles.select} 
                    value={materia} 
                    onChange={(m) => setMateria(m.target.value)}
                >
                    {listaMaterias.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.nombre}
                        </option>
                    ))}
                </select>
            </div>
            )}

            {/* Modalidad */}
            {showModalidad && (
            <div className={styles.filterGroup}>
                <label className={styles.label}>Modalidad</label>
                <select 
                    className={styles.select} 
                    value={modalidad} 
                    onChange={(mo) => setModalidad(mo.target.value)}
                >
                    <option value="todas">Todas las modalidades</option>
                    <option value="VIRTUAL">Solo Virtual</option>
                    <option value="COMBINADA">Solo Combinadas</option>
                    <option value="PRESENCIAL">Solo Presencial</option>
                </select>
            </div>
            )}
        </section>
    );
}

export default Filters;