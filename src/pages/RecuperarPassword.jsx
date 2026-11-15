
import { useState } from 'react';
import {
  solicitarCodigoRecuperacion,
  confirmarNuevaPassword,
} from '../services/api';
import logoUnahur from '../assets/unahur.jpeg';
import styles from './RecuperarPassword.module.css';

export default function RecuperarPassword({ theme, toggleTheme, onVolverLogin }) {
  const [paso, setPaso]                       = useState(1); // 1: Email | 2: Código | 3: Nueva clave | 4: Éxito
  const [usuario, setUsuario]                 = useState('');
  const [codigo, setCodigo]                   = useState('');
  const [codigoMockHint, setCodigoMockHint]   = useState(null);
  const [nuevaPassword, setNuevaPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);

  // ── Paso 1: Solicitar código al correo institucional ──────────────────────
  const handleEnviarCodigo = async (e) => {
    e.preventDefault();
    if (!usuario.trim()) {
      setError('Ingresá tu usuario o correo institucional.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await solicitarCodigoRecuperacion(usuario);
      if (res?.codigoMock) {
        setCodigoMockHint(res.codigoMock);
      }
      setPaso(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 2: Validar código ingresado ──────────────────────────────────────
  const handleValidarCodigo = (e) => {
    e.preventDefault();
    if (codigo.trim().length < 6) {
      setError('Ingresá el código de 6 dígitos enviado a tu correo.');
      return;
    }
    setError(null);
    setPaso(3);
  };

  // ── Paso 3: Guardar nueva contraseña ──────────────────────────────────────
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
      await confirmarNuevaPassword(usuario, codigo, nuevaPassword);
      setPaso(4);
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
          <h1 className={styles.title}>Recuperar Contraseña</h1>
          <p className={styles.subtitle}>
            Restablecimiento de credenciales para Personal Autorizado UNAHUR
          </p>
        </div>

        {/* Indicador visual de pasos */}
        {paso < 4 && (
          <div className={styles.stepsBar}>
            <span className={paso >= 1 ? styles.stepActive : styles.step}>1. Correo</span>
            <span className={styles.stepLine} />
            <span className={paso >= 2 ? styles.stepActive : styles.step}>2. Código</span>
            <span className={styles.stepLine} />
            <span className={paso >= 3 ? styles.stepActive : styles.step}>3. Nueva Clave</span>
          </div>
        )}

        {/* ── PASO 1: Correo Institucional ── */}
        {paso === 1 && (
          <form onSubmit={handleEnviarCodigo} className={styles.form}>
            <p className={styles.helperText}>
              Ingresá tu correo institucional registrado y te enviaremos un código de verificación para crear una nueva contraseña.
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

            {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

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
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 2: Código de Verificación ── */}
        {paso === 2 && (
          <form onSubmit={handleValidarCodigo} className={styles.form}>
            <div className={styles.infoBanner}>
              Enviamos un código de 6 dígitos a <strong>{usuario}</strong>.
            </div>

            {codigoMockHint && (
              <div className={styles.mockBox}>
                🧪 <strong>Modo Prueba:</strong> Tu código simulado es{' '}
                <code>{codigoMockHint}</code>{' '}
                <button
                  type="button"
                  className={styles.mockFillBtn}
                  onClick={() => setCodigo(codigoMockHint)}
                >
                  Autocompletar
                </button>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label htmlFor="rec-codigo">Código de verificación</label>
              <input
                id="rec-codigo"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                autoFocus
              />
            </div>

            {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnVolver}
                onClick={() => {
                  setPaso(1);
                  setError(null);
                }}
              >
                ← Cambiar correo
              </button>
              <button type="submit" className={styles.btnSubmit}>
                Verificar código
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 3: Nueva Contraseña ── */}
        {paso === 3 && (
          <form onSubmit={handleGuardarPassword} className={styles.form}>
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

            {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnVolver}
                onClick={() => {
                  setPaso(2);
                  setError(null);
                }}
                disabled={loading}
              >
                ← Atrás
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Crear contraseña'}
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 4: Confirmación Exitosa ── */}
        {paso === 4 && (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✅</div>
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