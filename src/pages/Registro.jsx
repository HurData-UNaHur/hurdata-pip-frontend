import { useEffect, useState } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { obtenerInstitutos, solicitarRegistroUsuario } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Campo, { ReglasPassword } from '../components/Campo';
import {
  validarConfirmacion, validarEmailInstitucional, validarNombre, validarPasswordNueva,
} from '../utils/validaciones';
import styles from './Login.module.css';

// id = rol del backend (app/api/permisos.py); nombre = lo que ve el usuario
const ROLES = [
  { id: 'directivo', nombre: 'Directivo' },
  { id: 'docente', nombre: 'Docente' },
  { id: 'no_docente', nombre: 'No Docente' },
];

export default function Registro({ theme, toggleTheme, onVolverLogin }) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [rol, setRol] = useState('docente');
  const [institutos, setInstitutos] = useState([]);
  const [idInstituto, setIdInstituto] = useState('');
  const [tocados, setTocados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  // El backend devuelve solo id y nombre de cada instituto (sin emails)
  useEffect(() => {
    obtenerInstitutos()
      .then((lista) => {
        setInstitutos(lista);
        if (lista.length > 0) setIdInstituto((prev) => prev || String(lista[0].id));
      })
      .catch(() => setError('No se pudieron cargar los institutos. Recargá la página.'));
  }, []);

  const errores = {
    email: validarEmailInstitucional(email),
    nombre: validarNombre(nombre),
    password: validarPasswordNueva(password),
    confirmacion: validarConfirmacion(confirmacion, password),
  };
  const marcar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));
  const instituto = institutos.find((i) => String(i.id) === idInstituto);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTocados({ email: true, nombre: true, password: true, confirmacion: true });
    if (Object.values(errores).some(Boolean)) return;
    if (!instituto) {
      setError('Elegí tu instituto para enviar la solicitud.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await solicitarRegistroUsuario({ email, nombre, password, rol, idInstituto: instituto.id });
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <AuthLayout theme={theme} toggleTheme={toggleTheme}>
        <div className={styles.form}>
          <div className={styles.encabezadoForm}>
            <h1 className={styles.tituloForm}>Solicitud enviada</h1>
          </div>
          <p className={styles.exito} role="status">
            <CircleCheck size={18} aria-hidden="true" />
            <span>
              Pediste acceso como <strong>{ROLES.find((r) => r.id === rol)?.nombre}</strong> del instituto{' '}
              <strong>{instituto?.nombre}</strong>. Cuando un directivo o administrador la apruebe, vas a poder ingresar con tu correo y tu contraseña.
            </span>
          </p>
          <button type="button" className={styles.ingresar} onClick={onVolverLogin}>
            Volver al ingreso
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout theme={theme} toggleTheme={toggleTheme}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.encabezadoForm}>
          <h1 className={styles.tituloForm}>Solicitar acceso</h1>
          <p className={styles.ayuda}>Completá tus datos. Un directivo o administrador revisa cada solicitud.</p>
        </div>

        <Campo
          id="reg-email" etiqueta="Correo institucional" valor={email} onChange={setEmail}
          onBlur={() => marcar('email')} error={errores.email} tocado={tocados.email}
          inputMode="email" autoComplete="username" placeholder="nombre@unahur.edu.ar"
          disabled={loading} autoFocus
        />
        <Campo
          id="reg-nombre" etiqueta="Nombre y apellido" valor={nombre} onChange={setNombre}
          onBlur={() => marcar('nombre')} error={errores.nombre} tocado={tocados.nombre}
          autoComplete="name" placeholder="Apellido, Nombre" disabled={loading}
        />
        <Campo
          id="reg-password" etiqueta="Contraseña" tipo="password" valor={password} onChange={setPassword}
          onBlur={() => marcar('password')} error={errores.password} tocado={tocados.password}
          autoComplete="new-password" disabled={loading}
        >
          <ReglasPassword password={password} />
        </Campo>
        <Campo
          id="reg-confirmacion" etiqueta="Repetí la contraseña" tipo="password" valor={confirmacion}
          onChange={setConfirmacion} onBlur={() => marcar('confirmacion')} error={errores.confirmacion}
          tocado={tocados.confirmacion} autoComplete="new-password" disabled={loading}
        />

        <fieldset className={styles.grupo}>
          <legend>Rol que pedís</legend>
          <div className={styles.opciones}>
            {ROLES.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={rol === opcion.id ? `${styles.opcion} ${styles.opcionActiva}` : styles.opcion}
                aria-pressed={rol === opcion.id}
                onClick={() => setRol(opcion.id)}
                disabled={loading}
              >
                {opcion.nombre}
              </button>
            ))}
          </div>
        </fieldset>

        <div className={styles.campo}>
          <label htmlFor="reg-instituto">Instituto</label>
          <select
            id="reg-instituto" value={idInstituto} onChange={(e) => setIdInstituto(e.target.value)}
            disabled={loading || institutos.length === 0} className={styles.select}
          >
            {institutos.length === 0 && <option value="">Sin institutos disponibles</option>}
            {institutos.map((inst) => <option key={inst.id} value={String(inst.id)}>{inst.nombre}</option>)}
          </select>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <button type="submit" className={styles.ingresar} disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar solicitud'}
        </button>
        <p className={styles.registro}>
          <button type="button" className={styles.enlace} onClick={onVolverLogin} disabled={loading}>
            Volver al ingreso
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
