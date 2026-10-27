
// Carga la URL desde el archivo .env o usa localhost por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
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

/**
 * Envía el archivo Excel del SIU al backend para ejecutar el pipeline ETL.
 * @param {File} file Archivo .xlsx seleccionado por el usuario
 */
export const uploadSiuExcel = async (file) => {
  const formData = new FormData();
  // El nombre de la clave debe ser 'archivo' para coincidir con `archivo: UploadFile` de FastAPI
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