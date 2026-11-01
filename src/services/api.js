// Carga la URL desde el archivo .env o usa localhost por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/*
 * Consulta el estado del backend y la lista de tablas en la DB SQLite.
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en checkHealth:", error);
    throw error;
  }
};

/*
 * Envía el archivo Excel del SIU al backend para ejecutar el pipeline ETL.
 * @param {File} file Archivo .xlsx seleccionado por el usuario
 */
export const uploadSiuExcel = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al procesar el archivo Excel.');
    }

    return data;
  } catch (error) {
    console.error("Error en uploadSiuExcel:", error);
    throw error;
  }
};

/*
 * Llama al endpoint DELETE de la API para ejecutar resetear_base_datos() en el servidor.
 */
export const resetDatabase = async () => {
  try {
    const response = await fetch(`${API_URL}/api/limpiar-db`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al reiniciar la base de datos.');
    }

    return data;
  } catch (error) {
    console.error("Error en resetDatabase:", error);
    throw error;
  }
};

/*
 * Obtiene la lista de períodos disponibles en la DB (solo períodos, sin carrera).
 * Usado por App.jsx para poblar el selector de períodos.
 */
export const getPeriodos = async () => {
  try {
    const response = await fetch(`${API_URL}/api/periodos`);
    if (!response.ok) throw new Error(`Error al obtener períodos: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en getPeriodos:", error);
    throw error;
  }
};

/*
 * Obtiene todas las combinaciones período + carrera cargadas en la DB.
 * Cada entrada representa un Excel individual identificable.
 * Usado por UploadModal para listar qué hay cargado.
 */
export const getPeriodosConCarreras = async () => {
  try {
    const response = await fetch(`${API_URL}/api/periodos-carreras`);
    if (!response.ok) throw new Error(`Error al obtener períodos con carreras: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en getPeriodosConCarreras:", error);
    throw error;
  }
};

/*
 * Elimina un período, opcionalmente filtrado por carrera.
 * @param {number} idPeriodo  ID del período a eliminar
 * @param {number|null} idCarrera  Si se pasa, borra solo esa carrera en ese período.
 *                                 Si se omite, borra el período completo.
 */
export const deletePeriodo = async (idPeriodo, idCarrera = null) => {
  try {
    const url = idCarrera
      ? `${API_URL}/api/periodos/${idPeriodo}?id_carrera=${idCarrera}`
      : `${API_URL}/api/periodos/${idPeriodo}`;

    const response = await fetch(url, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Error al eliminar el período.');
    return data;
  } catch (error) {
    console.error("Error en deletePeriodo:", error);
    throw error;
  }
};
