import { useState } from 'react';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import { loginUnahur } from '../services/api';
import RecuperarPassword from './RecuperarPassword';
import Registro from './Registro';
import logoUnahur from '../assets/logo-hurlingham.png';
import styles from './Login.module.css';
import IconoTema from '../components/IconoTema';

export default function Login({ theme, toggleTheme, onLoginSuccess }) {
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError('Completá tu correo institucional y tu contraseña.');
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
    <div className={styles.pagina}>
      {/* Barra institucional con los cuatro colores de la UNaHur */}
      <div className={styles.barra} aria-hidden="true" />

      <button
        type="button"
        className={styles.temaBtn}
        onClick={toggleTheme}
        title="Cambiar tema"
        aria-label="Cambiar tema"
      >
        <IconoTema theme={theme} />
      </button>

      {/* ── Identidad y contexto ── */}
      <aside className={styles.identidad}>
        <img src={logoUnahur} alt="UNaHur, Universidad Nacional de Hurlingham" className={styles.logo} />

        <div className={styles.titulos}>
          <h1 className={styles.titulo}>HurData: Dashboard Analítico de Gestión Académica</h1>
          <p className={styles.subtitulo}>Universidad Nacional de Hurlingham</p>
        </div>


      </aside>

      {/* ── Formulario ── */}
      <main className={styles.panelForm}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.encabezadoForm}>
            <h2 className={styles.tituloForm}>Ingresá a tu cuenta</h2>
            <p className={styles.ayuda}>Usá tu correo institucional de la UNaHur.</p>
          </div>

          <div className={styles.campo}>
            <label htmlFor="usuario">Correo institucional</label>
            <input
              id="usuario"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="nombre@unahur.edu.ar"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.conBoton}>
              <input
                id="password"
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.ojo}
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
                aria-pressed={verPassword}
                disabled={loading}
              >
                {verPassword
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            <div className={styles.olvido}>
              <button
                type="button"
                className={styles.enlace}
                onClick={() => setMostrarRecuperar(true)}
                disabled={loading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <button type="submit" className={styles.ingresar} disabled={loading}>
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>

          <p className={styles.registro}>
            ¿No tenés cuenta?
            <button
              type="button"
              className={styles.enlace}
              onClick={() => setMostrarRegistro(true)}
              disabled={loading}
            >
              Solicitar acceso
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
