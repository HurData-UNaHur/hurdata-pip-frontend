
import { useState } from 'react';
import { uploadSiuExcel } from '../services/api';
import styles from './UploadModal.module.css';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecciona un archivo .xlsx");
      return;
    }

    setLoading(true);
    setError(null);
    setResumen(null);

    try {
      const data = await uploadSiuExcel(file);
      setResumen(data.resumen);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h3>Cargar Acta/Reporte del SIU Guaraní</h3>
        <p>Selecciona el archivo <code>.xlsx</code> para actualizar la base de datos.</p>

        <form onSubmit={handleSubmit}>
          <input 
            type="file" 
            accept=".xlsx" 
            onChange={handleFileChange} 
            disabled={loading}
          />
          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={!file || loading}>
              {loading ? 'Procesando ETL...' : 'Procesar Archivo'}
            </button>
          </div>
        </form>

        {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

        {resumen && (
          <div className={styles.successMsg}>
            <p><strong>✅ Carga finalizada con éxito</strong></p>
            <pre className={styles.preResumen}>
              {JSON.stringify(resumen, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}