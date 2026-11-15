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




/*
 * BLOQUE MOCK DE AUTENTICACIÓN (Esto se podrá eliminar cuando la aplicación tenga el Alta.)
 */
const USUARIOS_MOCK_PRUEBA = [
  {
    usuario: 'docente@unahur.edu.ar',
    password: '123',
    nombre: 'Docente',
    cargo: 'Docente',
    role: 'autorizado',
  },
  {
    usuario: 'nodocente@unahur.edu.ar',
    password: '123',
    nombre: 'Nodocente',
    cargo: 'Nodocente',
    role: 'autorizado',
  },
  {
    usuario: 'directivo@unahur.edu.ar',
    password: '123',
    nombre: 'Directivo',
    cargo: 'Directivo',
    role: 'autorizado',
  },
];

/*
 * Autentica al personal autorizado de UNAHUR (Docentes, Nodocentes, Directivos).
 * Intenta validar contra el backend (/api/login) y, si aún no existe el endpoint, utiliza los usuarios de prueba (Mock).
 */
export const loginUnahur = async (usuario, password) => {
  const usuarioLimpio = usuario.trim().toLowerCase();

  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioLimpio, password }),
    });

    if (response.ok) {
      return await response.json();
    }

    // Si el backend responde 401/403 (credenciales inválidas reales), lanzamos error
    if (response.status === 401 || response.status === 403) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'Usuario o contraseña incorrectos.');
    }
  } catch (error) {
    // Si fue un error explícito de credenciales rechazadas por el backend, lo propagamos
    if (error.message.includes('incorrectos') || error.message.includes('autorizado')) {
      throw error;
    }
    // Si el endpoint /api/login aún no existe (404 / sin conexión), continuamos al Mock
  }

  // ── Validación Mock temporal ──────────────────────────────────────────────
  const encontrado = USUARIOS_MOCK_PRUEBA.find(
    (u) => u.usuario === usuarioLimpio && u.password === password
  );

  if (!encontrado) {
    throw new Error(
      'Credenciales inválidas o usuario no autorizado por UNAHUR (Docentes, Nodocentes o Directivos).'
    );
  }

  return {
    nombre: encontrado.nombre,
    usuario: encontrado.usuario,
    cargo: encontrado.cargo,
    role: encontrado.role, // 'autorizado'
  };
};


/*
 * ============================================================================
 * RECUPERACIÓN DE CONTRASEÑA (CON FALLBACK MOCK TEMPORAL)
 * ============================================================================
 */
export const solicitarCodigoRecuperacion = async (usuario) => {
  const usuarioLimpio = usuario.trim().toLowerCase();

  try {
    const response = await fetch(`${API_URL}/api/recuperar-password/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioLimpio }),
    });

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 404 || response.status === 400) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'El correo no figura como personal autorizado de UNAHUR.');
    }
  } catch (error) {
    if (error.message.includes('figura')) throw error;
    // Si aún no existe el endpoint en el backend, seguimos al Mock
  }

  // ── Validación Mock temporal ──────────────────────────────────────────────
  const existe = USUARIOS_MOCK_PRUEBA.some((u) => u.usuario === usuarioLimpio);
  if (!existe) {
    throw new Error(
      'El usuario no figura en el padrón autorizado (Docentes, Nodocentes o Directivos).'
    );
  }

  return {
    ok: true,
    codigoMock: '482910', // Código simulado para probar el flujo sin servidor SMTP
  };
};

export const confirmarNuevaPassword = async (usuario, codigo, nuevaPassword) => {
  const usuarioLimpio = usuario.trim().toLowerCase();

  try {
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

    if (response.status === 400 || response.status === 401) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'Código inválido o expirado.');
    }
  } catch (error) {
    if (error.message.includes('Código')) throw error;
  }

  // ── Actualización Mock en memoria para la sesión de prueba ────────────────
  if (codigo.trim() !== '482910') {
    throw new Error('El código de verificación ingresado es incorrecto.');
  }

  const userMock = USUARIOS_MOCK_PRUEBA.find((u) => u.usuario === usuarioLimpio);
  if (userMock) {
    userMock.password = nuevaPassword;
  }

  return { ok: true };
};



