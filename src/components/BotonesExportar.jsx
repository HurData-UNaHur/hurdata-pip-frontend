import { useState } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import styles from './BotonesExportar.module.css';
import Tooltip from './Tooltip';
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
      <Tooltip texto="Descargar la tabla como CSV (se abre en Excel)">
        <button type="button" disabled={deshabilitado} onClick={() => exportarCSV(obtener())}>
          <FileSpreadsheet size={14} aria-hidden="true" /> CSV
        </button>
      </Tooltip>
      <Tooltip texto="Descargar la tabla como PDF">
        <button type="button" disabled={deshabilitado || generando} onClick={pdf}>
          <FileDown size={14} aria-hidden="true" /> {generando ? 'Generando…' : 'PDF'}
        </button>
      </Tooltip>
      {error && <span role="alert" className={styles.error}>{error}</span>}
    </div>
  );
}

export default BotonesExportar;
