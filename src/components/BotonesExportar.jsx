import { useState } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import styles from './BotonesExportar.module.css';
import { exportarCSV, exportarPDF } from '../utils/exportar';

/*
 * Botones "CSV" y "PDF" para una tabla.
 * `obtener`: función que devuelve lo que se exporta en ese momento (así respeta
 * filtros y orden): { nombreArchivo, titulo, subtitulo, columnas, filas, horizontal }.
 */
function BotonesExportar({ obtener, deshabilitado = false }) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);

  const pdf = async () => {
    setGenerando(true);
    setError(null);
    try {
      await exportarPDF(obtener());
    } catch {
      setError('No se pudo generar el PDF.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className={styles.grupo}>
      <button type="button" disabled={deshabilitado} onClick={() => exportarCSV(obtener())}
        title="Descargar la tabla como CSV (se abre en Excel)">
        <FileSpreadsheet size={14} aria-hidden="true" /> CSV
      </button>
      <button type="button" disabled={deshabilitado || generando} onClick={pdf}
        title="Descargar la tabla como PDF">
        <FileDown size={14} aria-hidden="true" /> {generando ? 'Generando…' : 'PDF'}
      </button>
      {error && <span role="alert" className={styles.error}>{error}</span>}
    </div>
  );
}

export default BotonesExportar;
