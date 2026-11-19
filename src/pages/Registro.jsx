import { useState, useEffect } from 'react';
import { obtenerInstitutos, solicitarRegistroUsuario } from '../services/api';
import logoUnahur from '../assets/unahur.jpeg';
import styles from './Registro.module.css';

// id = rol del backend (app/api/permisos.py); nombre = lo que ve el usuario
const ROLES_OPCIONES = [
  { id: 'directivo', nombre: 'Directivo', icono: '🏛️' },
  { id: 'docente', nombre: 'Docente', icono: '🎓' },
  { id: 'no_docente', nombre: 'No Docente', icono: '📋' },
];

export default function Registro({ theme, toggleTheme, onVolverLogin }) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('docente');
  // Institutos: el backend devuelve solo id y nombre (los emails de las direcciones no llegan al navegador)
  const [listaInstitutos, setListaInstitutos] = useState([]);
  const [idInstituto, setIdInstituto]         = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    obtenerInstitutos()
      .then((institutos) => {
        setListaInstitutos(institutos);
        if (institutos.length > 0) setIdInstituto((prev) => prev || String(institutos[0].id));
      })
      .catch(() => {
        setListaInstitutos([]);
        setError('No se pudieron cargar los institutos.');
      });
  }, []);

  const institutoSeleccionado = listaInstitutos.find((i) => String(i.id) === idInstituto);
  const rolSeleccionado = ROLES_OPCIONES.find((r) => r.id === rol);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !nombre.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor, completá todos los campos.');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!rol) {
      setError('Seleccioná un rol.');
      return;
    }
    if (!institutoSeleccionado) {
      setError('Seleccioná tu instituto para enviar la solicitud.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await solicitarRegistroUsuario({
        email,
        nombre,
        password,
        rol,
        idInstituto: institutoSeleccionado.id,
      });
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button
        type="button"
        className={styles.themeBtn}
        onClick={toggleTheme}
        title="Cambiar Tema"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src={logoUnahur} alt="UNaHur" className={styles.logo} />
          </div>
          <h1 className={styles.title}>Registro de Usuario</h1>
          <p className={styles.subtitle}>
            Completá tus datos y elegí tu instituto
          </p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="reg-email">Correo</label>
              <input
                id="reg-email"
                type="email"
                placeholder="ejemplo@unahur.edu.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="reg-nombre">Nombre del Usuario</label>
              <input
                id="reg-nombre"
                type="text"
                placeholder="Ej: Apellido, Nombre SegundoNombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.twoCols}>
              <div className={styles.fieldGroup}>
                <label htmlFor="reg-pass">Contraseña</label>
                <input
                  id="reg-pass"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-pass2">Confirmar Contraseña</label>
                <input
                  id="reg-pass2"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* ── Selector de Rol (abajo de Confirmar Contraseña) ── */}
            <div className={styles.fieldGroup}>
              <label>Rol solicitado</label>
              <div className={styles.roleSelector}>
                {ROLES_OPCIONES.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    className={
                      rol === opcion.id
                        ? `${styles.roleOption} ${styles.roleOptionActive}`
                        : styles.roleOption
                    }
                    onClick={() => setRol(opcion.id)}
                    disabled={loading}
                  >
                    {opcion.icono} {opcion.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Instituto: su dirección recibe la solicitud (el email se resuelve en el backend) ── */}
            <div className={styles.directorBox}>
              <label htmlFor="reg-instituto">
                🏛️ Instituto
              </label>
              <select
                id="reg-instituto"
                value={idInstituto}
                onChange={(e) => setIdInstituto(e.target.value)}
                disabled={loading || listaInstitutos.length === 0}
              >
                {listaInstitutos.length === 0 && <option value="">Sin institutos disponibles</option>}
                {listaInstitutos.map((inst) => (
                  <option key={inst.id} value={String(inst.id)}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
              <small>
                Tu solicitud llegará a la dirección del instituto para darte el alta y confirmar tu rol.
              </small>
            </div>

            {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnVolver}
                onClick={onVolverLogin}
                disabled={loading}
              >
                ← Volver
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.successBanner}>
              ✅ <strong>¡Datos registrados!</strong> Tu solicitud como{' '}
              <strong>{rolSeleccionado?.nombre}</strong> quedó enviada a la dirección del instituto{' '}
              <strong>{institutoSeleccionado?.nombre}</strong>.
            </div>

            <button
              type="button"
              className={styles.btnSubmit}
              style={{ width: '100%' }}
              onClick={onVolverLogin}
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
