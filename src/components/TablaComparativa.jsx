import { useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import styles from './TablaComparativa.module.css';
import { formatearPeriodoCorto } from '../utils/texto';

function Cambio({ valor }) {
  if (valor == null) return <span className={styles.sinDato}>—</span>;
  if (valor === 0) {
    return <span className={styles.igual}><Minus size={14} className="icono-inline" aria-hidden="true" />0 pp</span>;
  }
  const empeoro = valor > 0; // más libres
  const Icono = empeoro ? ArrowUp : ArrowDown;
  return (
    <span className={empeoro ? styles.empeoro : styles.mejoro} title={empeoro ? 'Más libres que antes' : 'Menos libres que antes'}>
      <Icono size={14} className="icono-inline" aria-hidden="true" />
      {Math.abs(valor)} pp
    </span>
  );
}

const fmt = (v, sufijo = '') => (v == null ? '—' : `${v}${sufijo}`);

/*
 * Tabla período A vs período B, ordenable por columna.
 * filas: resultado de compararMaterias (utils/comparar.js).
 * Por defecto, primero lo que más empeoró (mayor aumento de libres).
 */
export default function TablaComparativa({ filas, periodoA, periodoB }) {
  const etiquetaA = formatearPeriodoCorto(periodoA);
  const etiquetaB = formatearPeriodoCorto(periodoB);
  const COLUMNAS = [
    { clave: 'nombre', titulo: 'Materia' },
    { clave: 'inscriptosB', titulo: `Inscriptos ${etiquetaA} → ${etiquetaB}` },
    { clave: 'libresA', titulo: `Libres ${etiquetaA}` },
    { clave: 'libresB', titulo: `Libres ${etiquetaB}` },
    { clave: 'cambio', titulo: 'Cambio', ayuda: 'Diferencia en puntos porcentuales del % de libres' },
  ];

  const [orden, setOrden] = useState({ clave: 'cambio', direccion: 'desc' });
  const ordenarPor = (clave) => setOrden((prev) => (
    prev.clave === clave
      ? { clave, direccion: prev.direccion === 'asc' ? 'desc' : 'asc' }
      : { clave, direccion: clave === 'nombre' ? 'asc' : 'desc' }
  ));

  const ordenadas = [...filas].sort((x, y) => {
    const a = x[orden.clave];
    const b = y[orden.clave];
    // Sin dato siempre al final, sin importar la dirección
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    const cmp = orden.clave === 'nombre'
      ? a.localeCompare(b, 'es', { sensitivity: 'base' })
      : a - b;
    return orden.direccion === 'asc' ? cmp : -cmp;
  });

  return (
    <div className={styles.contenedor}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            {COLUMNAS.map((col) => {
              const activa = orden.clave === col.clave;
              return (
                <th key={col.clave} aria-sort={activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    type="button"
                    className={styles.sortBtn}
                    onClick={() => ordenarPor(col.clave)}
                    title={`Ordenar por ${col.titulo}${col.ayuda ? ` — ${col.ayuda}` : ''}`}
                  >
                    {col.titulo}
                    <span className={activa ? styles.sortIconActive : styles.sortIcon} aria-hidden="true">
                      {activa ? (orden.direccion === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ordenadas.length === 0 && (
            <tr><td colSpan={5} className={styles.sinDato}>No hay materias para comparar.</td></tr>
          )}
          {ordenadas.map((f) => (
            <tr key={f.id}>
              <td><strong>{f.nombre}</strong></td>
              <td className={styles.sinCorte}>{fmt(f.inscriptosA)} → {fmt(f.inscriptosB)}</td>
              <td>{fmt(f.libresA, ' %')}</td>
              <td>{fmt(f.libresB, ' %')}</td>
              <td className={styles.sinCorte}><Cambio valor={f.cambio} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
