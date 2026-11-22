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
  const [touched, setTouched] = useState({ usuario: false, password: false });

  // Validaciones en tiempo real
  const validarUsuario = (valor) => {
    const limpio = valor.trim();
    if (!limpio) return 'El correo institucional es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return 'Ingresá un formato de correo válido.';
    if (!limpio.toLowerCase().endsWith('@unahur.edu.ar')) {
      return 'Debe ser un correo institucional (@unahur.edu.ar).';
    }
    return '';
  };

  const validarPassword = (valor) => {
    if (!valor.trim()) return 'La contraseña es obligatoria.';
    if (valor.length < 4) return 'La contraseña debe tener al menos 4 caracteres.';
    return '';
  };

  const erroresCampo = {
    usuario: validarUsuario(usuario),
    password: validarPassword(password),
  };

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
    setTouched({ usuario: true, password: true });

    if (erroresCampo.usuario || erroresCampo.password) {
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
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setTouched((prev) => ({ ...prev, usuario: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, usuario: true }))}
                disabled={loading}
                autoFocus
              />
              {touched.usuario && erroresCampo.usuario && (
                <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '2px' }}>
                  {erroresCampo.usuario}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouched((prev) => ({ ...prev, password: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                disabled={loading}
              />
              {touched.password && erroresCampo.password && (
                <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '2px' }}>
                  {erroresCampo.password}
                </span>
              )}
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