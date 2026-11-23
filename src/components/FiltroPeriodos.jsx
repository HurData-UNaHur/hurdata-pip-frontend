import { RotateCcw } from 'lucide-react';
import styles from './FiltroPeriodos.module.css';
import Segmentado from './Segmentado';
import Tooltip from './Tooltip';
import { formatearPeriodoCorto } from '../utils/texto';

const RANGOS = [
  { valor: 'todo', texto: 'Todo', ayuda: 'Todos los períodos cargados' },
  { valor: 'ultimos3', texto: 'Últimos 3 años' },
  { valor: 'ultimo', texto: 'Último año' },
  { valor: 'personalizado', texto: 'Personalizado', ayuda: 'Elegir desde qué período hasta cuál' },
];

/*
 * Franja de filtros del gráfico de Evolución: materia, rango de períodos y cuatrimestre.
 * Afecta solo al gráfico y a sus tarjetas (la comparación de dos períodos tiene sus propios selectores).
 *   periodos:  todos los de la carrera, del más viejo al más nuevo ({ label })
 *   parciales: Map de períodos con datos parciales (se marcan en las listas)
 *   materias:  [{ codigo, nombre }] de la carrera; materia '' = toda la carrera
 *   conteos:   { PRIMER, SEGUNDO } períodos de cada cuatrimestre dentro del rango actual;
 *              una opción sin períodos se deshabilita
 *   resumen:   frase que dice qué se está mostrando; sinDatos la marca como aviso
 *   hayCambios / onRestablecer: el botón aparece solo si algún filtro se movió del valor inicial
 * Los selectores Desde / Hasta se despliegan al elegir "Personalizado".
 */
export default function FiltroPeriodos({
  periodos, parciales, materias, materia, onMateria, modo, desde, hasta, onModo, onRango,
  cuatrimestre, onCuatrimestre, conteos, resumen, sinDatos, hayCambios, onRestablecer,
}) {
  const cuatrimestres = [
    { valor: 'todos', texto: 'Ambos', ayuda: 'Primer y segundo cuatrimestre' },
    {
      valor: 'PRIMER', texto: '1C', ayuda: 'Primer cuatrimestre', deshabilitada: conteos.PRIMER === 0,
      motivo: 'No hay períodos de 1C en este rango. Ampliá el rango o restablecé los filtros.',
    },
    {
      valor: 'SEGUNDO', texto: '2C', ayuda: 'Segundo cuatrimestre', deshabilitada: conteos.SEGUNDO === 0,
      motivo: 'No hay períodos de 2C en este rango. Ampliá el rango o restablecé los filtros.',
    },
  ];
  const abierto = modo === 'personalizado';

  const opciones = periodos.map((p) => (
    <option key={p.label} value={p.label}>
      {formatearPeriodoCorto(p.label)}{parciales.has(p.label) ? ' (parcial)' : ''}
    </option>
  ));

  return (
    <div className={styles.franja}>
      <div className={styles.fila}>
        <label className={styles.materia}>
          <span className={styles.etiqueta}>Materia</span>
          <select value={materia} onChange={(e) => onMateria(e.target.value)}>
            <option value="">Toda la carrera</option>
            {materias.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
          </select>
        </label>
        <div className={styles.grupo}>
          <span className={styles.etiqueta}>Período</span>
          <Segmentado etiqueta="Rango de períodos" opciones={RANGOS} valor={modo} onChange={onModo} />
        </div>
        <div className={styles.grupo}>
          <span className={styles.etiqueta}>Cuatrimestre</span>
          <Segmentado etiqueta="Cuatrimestre" opciones={cuatrimestres} valor={cuatrimestre} onChange={onCuatrimestre} />
          {hayCambios && (
            <Tooltip texto="Restablecer filtros">
              <button
                type="button"
                className={styles.restablecer}
                onClick={onRestablecer}
                aria-label="Restablecer filtros"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Se despliega sin saltos: el alto se anima de 0 al contenido */}
      <div className={abierto ? `${styles.desplegable} ${styles.abierto}` : styles.desplegable} inert={!abierto}>
        <div className={styles.interior}>
          <div className={styles.rango}>
            <label className={styles.selector}>
              <span>Desde</span>
              <select value={desde} onChange={(e) => onRango({ desde: e.target.value })}>{opciones}</select>
            </label>
            <label className={styles.selector}>
              <span>Hasta</span>
              <select value={hasta} onChange={(e) => onRango({ hasta: e.target.value })}>{opciones}</select>
            </label>
          </div>
        </div>
      </div>

      <p className={sinDatos ? `${styles.resumen} ${styles.sinDatos}` : styles.resumen} role="status">
        {resumen}
      </p>
    </div>
  );
}
