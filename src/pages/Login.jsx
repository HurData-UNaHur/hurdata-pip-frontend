import { useState } from 'react';
import { loginUnahur } from '../services/api';
import RecuperarPassword from './RecuperarPassword';
import Registro from './Registro';
import { TriangleAlert, User } from 'lucide-react';
import logoUnahur from '../assets/unahur.jpeg';
import styles from './Login.module.css';
import IconoTema from '../components/IconoTema';

export default function Login({ theme, toggleTheme, onLoginSuccess }) {
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
        <IconoTema theme={theme} />
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img src={logoUnahur} alt="UNaHur" className={styles.logo} />
          </div>
          {/* Quién (antetítulo) → qué (título) → para qué (descripción) */}
          <p className={styles.antetitulo}>Universidad Nacional de Hurlingham</p>
          <h1 className={styles.title}>HurData Académico</h1>
          <p className={styles.subtitle}>Análisis y seguimiento de cursadas</p>
        </div>

        {/* ── Formulario de ingreso (se muestra directo: la mayoría entra con su cuenta) ── */}
        <form onSubmit={handleSubmitAutorizado} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="usuario">Correo institucional</label>
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
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {error && (
              <p className={styles.errorMsg}>
                <TriangleAlert size={14} className="icono-inline" aria-hidden="true" />{error}
              </p>
            )}

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>

            <div className={styles.registerPrompt}>
              <span>¿No tenés cuenta?</span>
              <button
                type="button"
                className={styles.btnRegisterLink}
                onClick={() => setMostrarRegistro(true)}
                disabled={loading}
              >
                Solicitar acceso
              </button>
            </div>
        </form>

        {/* ── Acceso secundario: invitado de solo lectura ── */}
        <div className={styles.divider}>
          <span>o</span>
        </div>

        <button
          type="button"
          className={styles.btnInvitado}
          onClick={handleAccesoInvitado}
          disabled={loading}
        >
          <User size={16} aria-hidden="true" />
          Entrar como invitado
          <span className={styles.btnSubtextInvitado}>· solo lectura</span>
        </button>
      </div>
    </div>
  );
}