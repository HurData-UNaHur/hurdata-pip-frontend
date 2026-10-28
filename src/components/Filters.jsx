import styles from './Filters.module.css';

function Filters({ materia, setMateria, modalidad, setModalidad, listaMaterias = [] }) {
    return (
        <section className={styles.filtersContainer}>
            {/* Período */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Período</label>
                <select className={styles.select} defaultValue="2022-1C">
                    <option value="2022-1C">2022 - Primer Cuatrimestre</option>
                    <option value="2022-2C">2022 - Segundo Cuatrimestre</option>
                </select>
            </div>

            {/* Carrera */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Carrera</label>
                <select className={styles.select} defaultValue="info">
                    <option value="info">Licenciatura en Informática </option>
                </select>
            </div>

            {/* Materia */}
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

            {/* Modalidad */}
            <div className={styles.filterGroup}>
                <label className={styles.label}>Modalidad</label>
                <select className={styles.select} value={modalidad} onChange={(mo) => setModalidad(mo.target.value)}>
                    <option value="todas">Todas las modalidades </option>
                    <option value="VIRTUAL">Solo Virtual </option>
                    <option value="COMBINADA">Solo Combinadas </option>
                    <option value="PRESENCIAL">Solo Presencial </option>
                </select>
            </div>
        </section>
    );
}

export default Filters;
