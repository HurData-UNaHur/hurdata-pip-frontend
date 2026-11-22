import { useState } from 'react';
import {
  verificarUsuarioRecuperacion,
  confirmarNuevaPassword,
} from '../services/api';
import logoUnahur from '../assets/unahur.jpeg';
import styles from './RecuperarPassword.module.css';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import IconoTema from '../components/IconoTema';

// Mensaje de error del formulario
function ErrorMsg({ texto }) {
  return (
    <p className={styles.errorMsg}>
      <TriangleAlert size={14} className="icono-inline" aria-hidden="true" />{texto}
    </p>
  );
}

export default function RecuperarPassword({ theme, toggleTheme, onVolverLogin }) {
  const [paso, setPaso]                       = useState(1); // 1: Usuario | 2: Nueva clave | 3: Éxito
  const [usuario, setUsuario]                 = useState('');
  const [nuevaPassword, setNuevaPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);

  // ── Paso 1: Verificar que el usuario exista ───────────────────────────────
  const handleVerificarUsuario = async (e) => {
    e.preventDefault();
    if (!usuario.trim()) {
      setError('Ingresá tu usuario o correo institucional.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verificarUsuarioRecuperacion(usuario);
      setPaso(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 2: Guardar y confirmar nueva contraseña ──────────────────────────
  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await confirmarNuevaPassword(usuario, nuevaPassword);
      setPaso(3);
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
        <IconoTema theme={theme} />
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src={logoUnahur} alt="UNaHur" className={styles.logo} />
          </div>
          <h1 className={styles.title}>Recuperar Contraseña</h1>
          <p className={styles.subtitle}>
            Restablecimiento de credenciales para Personal Autorizado UNAHUR
          </p>
        </div>

        {/* Indicador visual de pasos */}
        {paso < 3 && (
          <div className={styles.stepsBar}>
            <span className={paso >= 1 ? styles.stepActive : styles.step}>1. Usuario</span>
            <span className={styles.stepLine} />
            <span className={paso >= 2 ? styles.stepActive : styles.step}>2. Nueva Clave</span>
          </div>
        )}

        {/* ── PASO 1: Correo Institucional ── */}
        {paso === 1 && (
          <form onSubmit={handleVerificarUsuario} className={styles.form}>
            <p className={styles.helperText}>
              Ingresá tu correo institucional registrado para establecer una nueva contraseña.
            </p>

            <div className={styles.fieldGroup}>
              <label htmlFor="rec-usuario">Usuario / Correo Institucional</label>
              <input
                id="rec-usuario"
                type="text"
                placeholder="docente@unahur.edu.ar"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            {error && <ErrorMsg texto={error} />}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnVolver}
                onClick={onVolverLogin}
                disabled={loading}
              >
                ← Volver al Login
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 2: Nueva Contraseña y Confirmación ── */}
        {paso === 2 && (
          <form onSubmit={handleGuardarPassword} className={styles.form}>
            <div className={styles.infoBanner}>
              Creando nueva contraseña para <strong>{usuario.trim().toLowerCase()}</strong>.
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="rec-pass1">Nueva Contraseña</label>
              <input
                id="rec-pass1"
                type="password"
                placeholder="••••••••"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="rec-pass2">Confirmar Nueva Contraseña</label>
              <input
                id="rec-pass2"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <ErrorMsg texto={error} />}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnVolver}
                onClick={() => {
                  setPaso(1);
                  setNuevaPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                disabled={loading}
              >
                ← Cambiar usuario
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Confirmar contraseña'}
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 3: Confirmación Exitosa ── */}
        {paso === 3 && (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <CircleCheck size={44} color="#16a34a" aria-hidden="true" />
            </div>
            <h3>¡Contraseña actualizada!</h3>
            <p>
              Ya podés iniciar sesión en <strong>HurData Académico</strong> con tu nueva clave.
            </p>
            <button
              type="button"
              className={styles.btnSubmit}
              style={{ width: '100%', marginTop: '8px' }}
              onClick={onVolverLogin}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}