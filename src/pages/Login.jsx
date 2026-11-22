import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { loginUnahur } from '../services/api';
import RecuperarPassword from './RecuperarPassword';
import Registro from './Registro';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import styles from './Login.module.css';

/* En el ingreso solo se exige que los campos no estén vacíos: la política de contraseña rige al crearla. */
const vacio = (mensaje) => (valor) => (valor.trim() ? '' : mensaje);
const errorUsuario = vacio('Ingresá tu correo institucional.');
const errorPassword = vacio('Ingresá tu contraseña.');

export default function Login({ theme, toggleTheme, onLoginSuccess }) {
  const [pantalla, setPantalla] = useState('login'); // 'login' | 'recuperar' | 'registro'
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [tocados, setTocados] = useState({ usuario: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const volver = () => {
    setPantalla('login');
    setError(null);
  };

  if (pantalla === 'recuperar') {
    return <RecuperarPassword theme={theme} toggleTheme={toggleTheme} onVolverLogin={volver} />;
  }
  if (pantalla === 'registro') {
    return <Registro theme={theme} toggleTheme={toggleTheme} onVolverLogin={volver} />;
  }

  const marcar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTocados({ usuario: true, password: true });
    if (errorUsuario(usuario) || errorPassword(password)) return;

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
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.encabezadoForm}>
          <h1 className={styles.tituloForm}>Ingresá a tu cuenta</h1>
          <p className={styles.ayuda}>Usá tu correo institucional de la UNaHur.</p>
        </div>

        <Campo
          id="usuario"
          etiqueta="Correo institucional"
          valor={usuario}
          onChange={setUsuario}
          onBlur={() => marcar('usuario')}
          error={errorUsuario(usuario)}
          tocado={tocados.usuario}
          inputMode="email"
          autoComplete="username"
          placeholder="nombre@unahur.edu.ar"
          disabled={loading}
          autoFocus
        />

        <Campo
          id="password"
          etiqueta="Contraseña"
          tipo="password"
          valor={password}
          onChange={setPassword}
          onBlur={() => marcar('password')}
          error={errorPassword(password)}
          tocado={tocados.password}
          autoComplete="current-password"
          placeholder="Tu contraseña"
          disabled={loading}
        >
          <div className={styles.olvido}>
            <button type="button" className={styles.enlace} onClick={() => setPantalla('recuperar')} disabled={loading}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </Campo>

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
          <button type="button" className={styles.enlace} onClick={() => setPantalla('registro')} disabled={loading}>
            Solicitar acceso
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
