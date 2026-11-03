import { useState, useEffect } from 'react';
import { uploadSiuExcel, resetDatabase, getPeriodosConCarreras, deletePeriodo } from '../services/api';
import styles from './UploadModal.module.css';

export default function UploadModal({ isOpen, onClose, onSuccess, onResetSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);

  // ── Estado para gestión de períodos ───────────────────────────────────────
  const [periodos, setPeriodos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]); // claves "idPeriodo_idCarrera"
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [showGestion, setShowGestion] = useState(false);

  // Clave única por fila (un período puede tener múltiples carreras)
  const claveItem = (p) => `${p.id_periodo}_${p.id_carrera}`;

  // Helper para re-consultar desde handlers de eventos
  const obtenerPeriodosAPI = async () => {
    setLoadingPeriodos(true);
    try {
      const data = await getPeriodosConCarreras();
      setPeriodos(data.periodos || []);
    } catch {
      setPeriodos([]);
    } finally {
      setLoadingPeriodos(false);
    }
  };

  // Cargar períodos cuando se abre la sección de gestión
  useEffect(() => {
    let cancelado = false;

    if (isOpen && showGestion) {
      getPeriodosConCarreras()
        .then((data) => {
          if (!cancelado) {
            setPeriodos(data.periodos || []);
            setLoadingPeriodos(false);
          }
        })
        .catch(() => {
          if (!cancelado) {
            setPeriodos([]);
            setLoadingPeriodos(false);
          }
        });
    }

    return () => { cancelado = true; };
  }, [isOpen, showGestion]);

  // Handler para alternar la vista de gestión
  const handleToggleGestion = () => {
    setShowGestion((prev) => {
      const siguiente = !prev;
      if (siguiente) setLoadingPeriodos(true);
      return siguiente;
    });
    setError(null);
  };

  // Handler unificado para cerrar y limpiar
  const handleClose = () => {
    setShowGestion(false);
    setSeleccionados([]);
    setError(null);
    setResumen(null);
    setFile(null);
    onClose();
  };

  // ── Handlers de formulario ────────────────────────────────────────────────
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecciona un archivo .xlsx');
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

  const handleResetDB = async () => {
    const confirmado = window.confirm(
      '⚠️ ¿Estás seguro de que deseas eliminar TODOS los datos cargados? La base volverá a su estado inicial (Mock).'
    );
    if (!confirmado) return;

    setLoading(true);
    setError(null);
    setResumen(null);
    try {
      await resetDatabase();
      setFile(null);
      setResumen(null);
      if (onResetSuccess) onResetSuccess();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers de selección ─────────────────────────────────────────────────
  const toggleSeleccion = (clave) => {
    setSeleccionados((prev) =>
      prev.includes(clave) ? prev.filter((x) => x !== clave) : [...prev, clave]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === periodos.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(periodos.map(claveItem));
    }
  };

  const handleEliminarSeleccionados = async () => {
    if (seleccionados.length === 0) return;

    const filasSeleccionadas = periodos.filter((p) => seleccionados.includes(claveItem(p)));
    const labels = filasSeleccionadas
      .map((p) => `${p.label} — ${p.nombre_carrera}`)
      .join('\n• ');

    const confirmado = window.confirm(
      `⚠️ ¿Eliminar los siguientes registros?\n\n• ${labels}\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        filasSeleccionadas.map((p) => deletePeriodo(p.id_periodo, p.id_carrera))
      );

      const eliminados = filasSeleccionadas.length;
      const restantes = periodos.filter((p) => !seleccionados.includes(claveItem(p)));

      setSeleccionados([]);

      if (restantes.length === 0) {
        if (onResetSuccess) onResetSuccess();
        handleClose();
      } else {
        await obtenerPeriodosAPI();
        if (onResetSuccess) onResetSuccess();
        setResumen({ message: `✅ ${eliminados} registro${eliminados > 1 ? 's eliminados' : ' eliminado'} con éxito.` });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const todosMarcados = periodos.length > 0 && seleccionados.length === periodos.length;
  const algunoMarcado = seleccionados.length > 0;

  // Return condicional SIEMPRE al final, después de todos los hooks
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {/* Botón X superior derecho */}
        <button
          type="button"
          className={styles.btnCloseIcon}
          onClick={handleClose}
          disabled={loading}
          title="Cerrar"
        >
          ✕
        </button>

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
            <button
              type="button"
              onClick={handleResetDB}
              disabled={loading}
              className={styles.btnReset}
            >
              🗑️ Resetear DB
            </button>
            <button
              type="button"
              onClick={handleToggleGestion}
              disabled={loading}
              className={styles.btnGestion}
            >
              📋 {showGestion ? 'Ocultar períodos' : 'Gestionar períodos'}
            </button>
            <button type="button" onClick={handleClose} disabled={loading} className={styles.btnCancelar}>
              Cancelar
            </button>
            <button type="submit" disabled={!file || loading} className={styles.btnProcesar}>
              {loading ? 'Procesando...' : 'Procesar Archivo'}
            </button>
          </div>
        </form>

        {/* ── Sección de gestión de períodos ── */}
        {showGestion && (
          <div className={styles.gestionPeriodos}>
            <div className={styles.gestionHeader}>
              <h4 className={styles.gestionTitle}>Períodos cargados</h4>
              {periodos.length > 0 && (
                <button
                  type="button"
                  className={styles.btnEliminarSel}
                  onClick={handleEliminarSeleccionados}
                  disabled={!algunoMarcado || loading}
                >
                  🗑️ Eliminar seleccionados ({seleccionados.length})
                </button>
              )}
            </div>

            {loadingPeriodos ? (
              <p className={styles.gestionVacio}>Cargando períodos...</p>
            ) : periodos.length === 0 ? (
              <p className={styles.gestionVacio}>No hay períodos cargados en la base de datos.</p>
            ) : (
              <table className={styles.tablaPeriodos}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={todosMarcados}
                        onChange={toggleTodos}
                        title="Seleccionar todos"
                      />
                    </th>
                    <th>Período</th>
                    <th>Carrera</th>
                  </tr>
                </thead>
                <tbody>
                  {periodos.map((p) => {
                    const clave = claveItem(p);
                    return (
                      <tr
                        key={clave}
                        className={seleccionados.includes(clave) ? styles.filaSeleccionada : ''}
                        onClick={() => toggleSeleccion(clave)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={seleccionados.includes(clave)}
                            onChange={() => toggleSeleccion(clave)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{p.label}</td>
                        <td>{p.nombre_carrera}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

        {resumen && (
          <div className={styles.successMsg}>
            {resumen.message ? (
              <p><strong>{resumen.message}</strong></p>
            ) : (
              <>
                <p><strong>✅ Operación finalizada con éxito</strong></p>
                <pre className={styles.preResumen}>
                  {JSON.stringify(resumen, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}