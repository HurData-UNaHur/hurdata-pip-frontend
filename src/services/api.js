// Carga la URL desde el archivo .env o usa localhost por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/*
 * ============================================================================
 * SESIÓN Y REQUESTS PROTEGIDOS
 * ============================================================================
 */

function decodeJwtPayload(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/*
 * Devuelve true si el token existe, se puede decodificar y no expiró.
 * El campo 'exp' del JWT está en segundos desde epoch.
 */
export const esTokenVigente = (token) => {
  if (!token) return false;
  try {
    const { exp } = decodeJwtPayload(token);
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/*
 * Permisos que vienen en el JWT (ver backend app/api/permisos.py).
 * Solo sirven para mostrar u ocultar botones: el backend valida cada acción.
 */
export const PERMISOS = {
  CARGAR: 'datos:cargar',
  BORRAR: 'datos:borrar',
  BORRAR_CUALQUIERA: 'datos:borrar_cualquiera',
  RESETEAR_DB: 'db:resetear',
  VER_CARGAS: 'cargas:ver',
  VER_TODAS_LAS_CARGAS: 'cargas:ver_todas',
};

export const tienePermiso = (usuario, permiso) =>
  Array.isArray(usuario?.permisos) && usuario.permisos.includes(permiso);

/*
 * Borra la sesión guardada y vuelve al login.
 * Devuelve una promesa que nunca se resuelve para que el código que llamó no siga.
 */
const cerrarSesionYRedirigir = () => {
  localStorage.removeItem('hurdata_token');
  localStorage.removeItem('hurdata_usuario');
  window.location.href = '/';
  return new Promise(() => {});
};

/*
 * fetch para endpoints protegidos: agrega el Bearer token y, si el backend
 * responde 401 (token ausente, inválido o expirado), cierra la sesión.
 * Si el backend responde con error, lanza Error con el 'detail' o mensajeError.
 */
const fetchProtegido = async (url, options, mensajeError) => {
  const token = localStorage.getItem('hurdata_token');
  if (!esTokenVigente(token)) return cerrarSesionYRedirigir();

  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) return cerrarSesionYRedirigir();

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || mensajeError);
  return data;
};

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
    return await fetchProtegido(
      `${API_URL}/upload`,
      { method: 'POST', body: formData },
      'Error al procesar el archivo Excel.'
    );
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
    return await fetchProtegido(
      `${API_URL}/api/limpiar-db`,
      { method: 'DELETE' },
      'Error al reiniciar la base de datos.'
    );
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
    // Requiere login: devuelve también cargado_por y puede_borrar por fila
    return await fetchProtegido(
      `${API_URL}/api/periodos-carreras`,
      { method: 'GET' },
      'Error al obtener los períodos cargados.'
    );
  } catch (error) {
    console.error("Error en getPeriodosConCarreras:", error);
    throw error;
  }
};

/*
 * Historial de Excel cargados (requiere el permiso cargas:ver).
 * Admin y Directivo reciben todas las cargas; el Docente solo las suyas.
 * @param {string|null} estado  'activa' | 'reemplazada' | 'borrada'; null = todas
 */
export const getCargas = async (estado = null) => {
  const url = estado
    ? `${API_URL}/api/cargas?estado=${encodeURIComponent(estado)}`
    : `${API_URL}/api/cargas`;
  return fetchProtegido(url, { method: 'GET' }, 'Error al obtener el historial de cargas.');
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

    return await fetchProtegido(url, { method: 'DELETE' }, 'Error al eliminar el período.');
  } catch (error) {
    console.error("Error en deletePeriodo:", error);
    throw error;
  }
};


/*
 * ============================================================================
 * AUTENTICACIÓN JWT
 * ============================================================================
 */

/*
 * Autentica al personal autorizado de UNAHUR contra el backend real.
 * Guarda el token JWT y los datos del usuario en localStorage.
 */
export const loginUnahur = async (usuario, password) => {
  const usuarioLimpio = usuario.trim().toLowerCase();

  let response;
  try {
    response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioLimpio, password }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  if (response.status === 401) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Usuario o contraseña incorrectos.');
  }

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`);
  }

  const { access_token } = await response.json();

  const payload = decodeJwtPayload(access_token);
  const datosUsuario = {
    nombre:   payload.nombre,
    cargo:    payload.cargo,
    role:     payload.role,
    usuario:  payload.sub,
    permisos: payload.permisos || [],
  };
  localStorage.setItem('hurdata_token', access_token);
  localStorage.setItem('hurdata_usuario', JSON.stringify(datosUsuario));

  return datosUsuario;
};


/*
 * ============================================================================
 * RECUPERACIÓN DE CONTRASEÑA
 * ============================================================================
 */
export const solicitarCodigoRecuperacion = async (usuario) => {
  const usuarioLimpio = usuario.trim().toLowerCase();

  const response = await fetch(`${API_URL}/api/recuperar-password/solicitar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: usuarioLimpio }),
  });

  if (response.ok) {
    return await response.json();
  }

  const errData = await response.json().catch(() => ({}));
  throw new Error(errData.detail || 'El correo no figura como personal autorizado de UNAHUR.');
};

export const confirmarNuevaPassword = async (usuario, codigo, nuevaPassword) => {
  const usuarioLimpio = usuario.trim().toLowerCase();

  const response = await fetch(`${API_URL}/api/recuperar-password/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario: usuarioLimpio,
      codigo: codigo.trim(),
      nueva_password: nuevaPassword,
    }),
  });

  if (response.ok) {
    return await response.json();
  }

  const errData = await response.json().catch(() => ({}));
  throw new Error(errData.detail || 'Código inválido o expirado.');
};


/*
 * ============================================================================
 * DIRECTIVOS
 * ============================================================================
 */

/*
 * Obtiene la lista de directivos desde el backend.
 * Retorna el array directivos del objeto { directivos: [...] }.
 */
export const obtenerDirectivos = async () => {
  const response = await fetch(`${API_URL}/api/directivos`);
  if (!response.ok) throw new Error('Error al obtener la lista de directivos.');
  const data = await response.json();
  return data.directivos;
};


/*
 * ============================================================================
 * REGISTRO CON APROBACIÓN DE DIRECTIVO
 * ============================================================================
 */
export const solicitarRegistroUsuario = async ({
  email,
  nombre,
  password,
  directivoEmail,
}) => {
  const payload = {
    email: email.trim().toLowerCase(),
    nombre: nombre.trim(),
    password,
    directivo_email: directivoEmail,
  };

  const response = await fetch(`${API_URL}/api/registro/solicitar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return await response.json();
  }

  const errData = await response.json().catch(() => ({}));
  throw new Error(
    errData.detail || 'Ese correo ya se encuentra registrado o tiene una solicitud pendiente.'
  );
};
