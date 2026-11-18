import { useState } from 'react';
import { loginUnahur } from '../services/api';
import RecuperarPassword from './RecuperarPassword';
import Registro from './Registro';
import logoUnahur from '../assets/unahur.jpeg';
import styles from './Login.module.css';

export default function Login({ theme, toggleTheme, onLoginSuccess }) {
  const [modoAutorizado, setModoAutorizado] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (mostrarRecuperar) {
    return (
      <RecuperarPassword
        theme={theme}
        toggleTheme={toggleTheme}
        onVolverLogin={() => {
          setMostrarRecuperar(false);
          setModoAutorizado(true);
          setError(null);
        }}
      />
    );
  }

  if (mostrarRegistro) {
    return (
      <Registro
        theme={theme}
        toggleTheme={toggleTheme}
        onVolverLogin={() => {
          setMostrarRegistro(false);
          setModoAutorizado(true);
          setError(null);
        }}
      />
    );
  }

  const handleAccesoInvitado = () => {
    const sesionInvitado = {
      nombre: 'Invitado',
      cargo: 'Acceso Temporal',
      role: 'invitado',
    };
    onLoginSuccess(sesionInvitado);
  };

  const handleSubmitAutorizado = async (e) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError('Por favor, completá tu usuario institucional y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const datosUsuario = await loginUnahur(usuario, password);
      onLoginSuccess(datosUsuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Botón flotante para cambiar Modo Día / Modo Oscuro en el Login */}
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
          <h1 className={styles.title}>HurData Académico</h1>
          <p className={styles.subtitle}>
            Universidad Nacional de Hurlingham — Análisis y Seguimiento de Cursadas
          </p>
        </div>

        {!modoAutorizado ? (
          /* ── Vista inicial: Selección de tipo de acceso ── */
          <div className={styles.optionsContainer}>
            <button
              type="button"
              className={styles.btnAutorizado}
              onClick={() => {
                setModoAutorizado(true);
                setError(null);
              }}
            >
              🔐 Personal Autorizado UNAHUR
              <span className={styles.btnSubtext}>
                Docentes, No Docentes y Directivos (Sesión persistente)
              </span>
            </button>

            <div className={styles.divider}>
              <span>o bien</span>
            </div>

            <button
              type="button"
              className={styles.btnInvitado}
              onClick={handleAccesoInvitado}
            >
              👤 Entrar como Invitado
              <span className={styles.btnSubtextInvitado}>
                Acceso temporal de lectura (sin modificación de archivos, se cierra al recargar)
              </span>
            </button>
          </div>
        ) : (
          /* ── Formulario para Personal Autorizado UNAHUR ── */
          <form onSubmit={handleSubmitAutorizado} className={styles.form}>
            <div className={styles.infoBanner}>
              Acceso exclusivo para <strong>Docentes, No Docentes y Directivos</strong> autorizados por la Universidad Nacional de Hurlingham.
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="usuario">Usuario / Correo Institucional</label>
              <input
                id="usuario"
                type="text"
                placeholder="ejemplo@unahur.edu.ar"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className={styles.forgotWrapper}>
                <button
                  type="button"
                  className={styles.btnForgotLink}
                  onClick={() => setMostrarRecuperar(true)}
                  disabled={loading}
                >
                  Recuperar contraseña
                </button>
              </div>
            </div>

            {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnVolver}
                onClick={() => {
                  setModoAutorizado(false);
                  setError(null);
                }}
                disabled={loading}
              >
                ← Volver
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
            </div>

            {/* ── Botón de Registro ── */}
            <div className={styles.registerPrompt}>
              <span>¿No tenés usuario autorizado?</span>
              <button
                type="button"
                className={styles.btnRegisterLink}
                onClick={() => setMostrarRegistro(true)}
                disabled={loading}
              >
                Registrarse
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}