import { useState, useEffect } from 'react';
import { CircleCheck, ClipboardList, GraduationCap, Landmark, TriangleAlert } from 'lucide-react';
import { obtenerInstitutos, solicitarRegistroUsuario } from '../services/api';
import IconoTema from '../components/IconoTema';
import logoUnahur from '../assets/unahur.jpeg';
import styles from './Registro.module.css';

// id = rol del backend (app/api/permisos.py); nombre = lo que ve el usuario
const ROLES_OPCIONES = [
  { id: 'directivo', nombre: 'Directivo', Icono: Landmark },
  { id: 'docente', nombre: 'Docente', Icono: GraduationCap },
  { id: 'no_docente', nombre: 'No Docente', Icono: ClipboardList },
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
  const [touched, setTouched] = useState({
    email: false,
    nombre: false,
    password: false,
    confirmPassword: false,
  });

  // Validaciones en tiempo real
  const validarEmail = (valor) => {
    const limpio = valor.trim();
    if (!limpio) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return 'Ingresá un formato de correo válido.';
    if (!limpio.toLowerCase().endsWith('@unahur.edu.ar')) {
      return 'Debe ser un correo institucional (@unahur.edu.ar).';
    }
    return '';
  };

  const validarNombre = (valor) => {
    const limpio = valor.trim();
    if (!limpio) return 'El nombre es obligatorio.';
    if (limpio.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    return '';
  };

  const validarPassword = (valor) => {
    if (!valor.trim()) return 'La contraseña es obligatoria.';
    if (valor.length < 4) return 'La contraseña debe tener al menos 4 caracteres.';
    return '';
  };

  const validarConfirmPassword = (valor, passOriginal) => {
    if (!valor) return 'Confirmá tu contraseña.';
    if (valor !== passOriginal) return 'Las contraseñas no coinciden.';
    return '';
  };

  const erroresCampo = {
    email: validarEmail(email),
    nombre: validarNombre(nombre),
    password: validarPassword(password),
    confirmPassword: validarConfirmPassword(confirmPassword, password),
  };

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
    setTouched({
      email: true,
      nombre: true,
      password: true,
      confirmPassword: true,
    });

    if (
      erroresCampo.email ||
      erroresCampo.nombre ||
      erroresCampo.password ||
      erroresCampo.confirmPassword
    ) {
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
        <IconoTema theme={theme} />
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTouched((prev) => ({ ...prev, email: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                disabled={loading}
                autoFocus
              />
              {touched.email && erroresCampo.email && (
                <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '2px' }}>
                  {erroresCampo.email}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="reg-nombre">Nombre del Usuario</label>
              <input
                id="reg-nombre"
                type="text"
                placeholder="Ej: Apellido, Nombre SegundoNombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setTouched((prev) => ({ ...prev, nombre: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, nombre: true }))}
                disabled={loading}
              />
              {touched.nombre && erroresCampo.nombre && (
                <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '2px' }}>
                  {erroresCampo.nombre}
                </span>
              )}
            </div>

            <div className={styles.twoCols}>
              <div className={styles.fieldGroup}>
                <label htmlFor="reg-pass">Contraseña</label>
                <input
                  id="reg-pass"
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
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-pass2">Confirmar Contraseña</label>
                <input
                  id="reg-pass2"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  disabled={loading}
                />
                {touched.confirmPassword && erroresCampo.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '2px' }}>
                    {erroresCampo.confirmPassword}
                  </span>
                )}
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
                    <opcion.Icono size={15} className="icono-inline" aria-hidden="true" />
                    {opcion.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Instituto: su dirección recibe la solicitud (el email se resuelve en el backend) ── */}
            <div className={styles.directorBox}>
              <label htmlFor="reg-instituto">
                <Landmark size={15} className="icono-inline" aria-hidden="true" />
                Instituto
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

            {error && (
              <p className={styles.errorMsg}>
                <TriangleAlert size={14} className="icono-inline" aria-hidden="true" />{error}
              </p>
            )}

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
              <CircleCheck size={16} className="icono-inline" aria-hidden="true" />
              <strong>¡Datos registrados!</strong> Tu solicitud como{' '}
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