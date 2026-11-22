import { useState } from 'react';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { canjearCodigoRecuperacion, solicitarRecuperacion } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Campo, { ReglasPassword } from '../components/Campo';
import {
  validarCodigo, validarConfirmacion, validarEmailInstitucional, validarPasswordNueva,
} from '../utils/validaciones';
import styles from './Login.module.css';

/*
 * Recuperación por solicitud (no hay servidor de mail):
 *   pedir → enviada → canjear → listo
 * Un directivo o administrador aprueba el pedido y le pasa a la persona un código de un solo uso.
 */
export default function RecuperarPassword({ theme, toggleTheme, onVolverLogin }) {
  const [paso, setPaso] = useState('pedir');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [tocados, setTocados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const errores = {
    email: validarEmailInstitucional(email),
    codigo: validarCodigo(codigo),
    password: validarPasswordNueva(password),
    confirmacion: validarConfirmacion(confirmacion, password),
  };
  const marcar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));
  const ir = (siguiente) => {
    setPaso(siguiente);
    setError(null);
    setTocados({});
  };

  const enviar = (campos, accion, siguiente) => async (e) => {
    e.preventDefault();
    setTocados(Object.fromEntries(campos.map((c) => [c, true])));
    if (campos.some((c) => errores[c])) return;

    setLoading(true);
    setError(null);
    try {
      await accion();
      ir(siguiente);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bloqueError = error && (
    <p className={styles.error} role="alert">
      <TriangleAlert size={16} aria-hidden="true" />
      <span>{error}</span>
    </p>
  );

  return (
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      {paso === 'pedir' && (
        <form
          className={styles.form} noValidate
          onSubmit={enviar(['email'], () => solicitarRecuperacion(email), 'enviada')}
        >
          <div className={styles.encabezadoForm}>
            <h1 className={styles.tituloForm}>Recuperar contraseña</h1>
            <p className={styles.ayuda}>
              Un directivo o administrador revisa tu pedido y te da un código para elegir una contraseña nueva.
            </p>
          </div>
          <Campo
            id="rec-email" etiqueta="Correo institucional" valor={email} onChange={setEmail}
            onBlur={() => marcar('email')} error={errores.email} tocado={tocados.email}
            inputMode="email" autoComplete="username" placeholder="nombre@unahur.edu.ar"
            disabled={loading} autoFocus
          />
          {bloqueError}
          <button type="submit" className={styles.ingresar} disabled={loading}>
            {loading ? 'Enviando…' : 'Pedir recuperación'}
          </button>
          <p className={styles.registro}>
            <button type="button" className={styles.enlace} onClick={() => ir('canjear')} disabled={loading}>
              Ya tengo un código
            </button>
          </p>
          <p className={styles.registro}>
            <button type="button" className={styles.enlace} onClick={onVolverLogin} disabled={loading}>
              Volver al ingreso
            </button>
          </p>
        </form>
      )}

      {paso === 'enviada' && (
        <div className={styles.form}>
          <div className={styles.encabezadoForm}>
            <h1 className={styles.tituloForm}>Pedido enviado</h1>
          </div>
          <p className={styles.exito} role="status">
            <Info size={18} aria-hidden="true" />
            <span>
              Si el correo está registrado, tu pedido quedó en revisión. Pedile el código a un directivo o
              administrador de tu instituto. El código vale 60 minutos y se usa una sola vez.
            </span>
          </p>
          <button type="button" className={styles.ingresar} onClick={() => ir('canjear')}>
            Ingresar el código
          </button>
          <p className={styles.registro}>
            <button type="button" className={styles.enlace} onClick={onVolverLogin}>Volver al ingreso</button>
          </p>
        </div>
      )}

      {paso === 'canjear' && (
        <form
          className={styles.form} noValidate
          onSubmit={enviar(
            ['email', 'codigo', 'password', 'confirmacion'],
            () => canjearCodigoRecuperacion(email, codigo, password),
            'listo',
          )}
        >
          <div className={styles.encabezadoForm}>
            <h1 className={styles.tituloForm}>Elegí tu nueva contraseña</h1>
            <p className={styles.ayuda}>Ingresá el código que te dieron.</p>
          </div>
          <Campo
            id="can-email" etiqueta="Correo institucional" valor={email} onChange={setEmail}
            onBlur={() => marcar('email')} error={errores.email} tocado={tocados.email}
            inputMode="email" autoComplete="username" placeholder="nombre@unahur.edu.ar" disabled={loading}
          />
          <Campo
            id="can-codigo" etiqueta="Código" valor={codigo} onChange={(v) => setCodigo(v.toUpperCase())}
            onBlur={() => marcar('codigo')} error={errores.codigo} tocado={tocados.codigo}
            autoComplete="one-time-code" placeholder="K7M2-9QXP" maxLength={9} disabled={loading}
          />
          <Campo
            id="can-password" etiqueta="Contraseña nueva" tipo="password" valor={password} onChange={setPassword}
            onBlur={() => marcar('password')} error={errores.password} tocado={tocados.password}
            autoComplete="new-password" disabled={loading}
          >
            <ReglasPassword password={password} />
          </Campo>
          <Campo
            id="can-confirmacion" etiqueta="Repetí la contraseña" tipo="password" valor={confirmacion}
            onChange={setConfirmacion} onBlur={() => marcar('confirmacion')} error={errores.confirmacion}
            tocado={tocados.confirmacion} autoComplete="new-password" disabled={loading}
          />
          {bloqueError}
          <button type="submit" className={styles.ingresar} disabled={loading}>
            {loading ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
          <p className={styles.registro}>
            <button type="button" className={styles.enlace} onClick={() => ir('pedir')} disabled={loading}>
              Todavía no pedí un código
            </button>
          </p>
        </form>
      )}

      {paso === 'listo' && (
        <div className={styles.form}>
          <div className={styles.encabezadoForm}>
            <h1 className={styles.tituloForm}>Contraseña actualizada</h1>
          </div>
          <p className={styles.exito} role="status">
            <CircleCheck size={18} aria-hidden="true" />
            <span>Ya podés ingresar con tu contraseña nueva.</span>
          </p>
          <button type="button" className={styles.ingresar} onClick={onVolverLogin}>
            Ir al ingreso
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
