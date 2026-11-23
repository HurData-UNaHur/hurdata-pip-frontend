import { useId } from 'react';
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
    const id = useId();
    // Solo las carreras cargadas en la DB (sin valores por defecto inventados)
    const carrerasAMostrar = listaCarreras || [];

    // Prioriza la prop 'carrera'; si no, la primera de la lista
    const valorCarreraSeleccionada = carrera || (carrerasAMostrar[0]?.nombre ?? '');

    return (
        <section className={styles.filtersContainer}>
            {/* Período */}
            <div className={styles.filterGroup}>
                <label htmlFor={`${id}-periodo`} className={styles.label}>Período</label>
                <select id={`${id}-periodo`} 
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
                        <option value="">Sin períodos cargados</option>
                    )}
                </select>
            </div>

            {/* Carrera Dinámica */}
            <div className={styles.filterGroup}>
                <label htmlFor={`${id}-carrera`} className={styles.label}>Carrera</label>
                <select id={`${id}-carrera`} 
                    className={styles.select} 
                    value={valorCarreraSeleccionada} 
                    onChange={(e) => setCarrera && setCarrera(e.target.value)}
                >
                    {carrerasAMostrar.length === 0 && <option value="">Sin carreras cargadas</option>}
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
                <label htmlFor={`${id}-materia`} className={styles.label}>Materia</label>
                <select id={`${id}-materia`} 
                    className={styles.select} 
                    value={materia} 
                    onChange={(m) => setMateria(m.target.value)}
                >
                    {listaMaterias.length === 0 && <option value="">Sin materias cargadas</option>}
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
                <label htmlFor={`${id}-modalidad`} className={styles.label}>Modalidad</label>
                <select id={`${id}-modalidad`} 
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