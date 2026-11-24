import { useEffect, useId, useState } from 'react';
import { KeyRound, TriangleAlert } from 'lucide-react';
import styles from './Cuenta.module.css';
import Campo, { ReglasPassword } from '../components/Campo';
import { useToast } from '../components/contextoToast';
import { cambiarPassword, getPerfil } from '../services/api';
import { validarConfirmacion, validarPasswordNueva } from '../utils/validaciones';

const NOMBRE_ROL = {
  admin: 'Administrador',
  directivo: 'Directivo',
  docente: 'Docente',
  no_docente: 'No docente',
};

const CAMPOS_VACIOS = { actual: '', nueva: '', confirmacion: '' };

/*
 * Mi cuenta: los datos de quien tiene la sesión iniciada y el cambio de contraseña.
 * Los datos se leen del backend (GET /api/perfil), no del token, así reflejan el estado real.
 */
function Cuenta() {
  const { avisar } = useToast();
  const idForm = useId();
  const [perfil, setPerfil] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [intento, setIntento] = useState(0);

  const [formAbierto, setFormAbierto] = useState(false);
  const [campos, setCampos] = useState(CAMPOS_VACIOS);
  const [tocados, setTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  useEffect(() => {
    let cancelado = false;
    getPerfil()
      .then((datos) => { if (!cancelado) { setPerfil(datos); setErrorCarga(''); } })
      .catch((err) => { if (!cancelado) setErrorCarga(err.message); });
    return () => { cancelado = true; };
  }, [intento]);

  const cambiar = (clave) => (valor) => setCampos((prev) => ({ ...prev, [clave]: valor }));
  const marcar = (clave) => () => setTocados((prev) => ({ ...prev, [clave]: true }));

  const errores = {
    actual: campos.actual ? '' : 'Ingresá tu contraseña actual.',
    nueva: validarPasswordNueva(campos.nueva)
      || (campos.nueva === campos.actual ? 'La nueva contraseña tiene que ser distinta de la actual.' : ''),
    confirmacion: validarConfirmacion(campos.confirmacion, campos.nueva),
  };

  const cerrarForm = () => {
    setFormAbierto(false);
    setCampos(CAMPOS_VACIOS);
    setTocados({});
    setErrorEnvio('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setTocados({ actual: true, nueva: true, confirmacion: true });
    if (errores.actual || errores.nueva || errores.confirmacion) return;
    setEnviando(true);
    setErrorEnvio('');
    try {
      await cambiarPassword(campos.actual, campos.nueva);
      cerrarForm();
      avisar({ tipo: 'exito', texto: 'Cambiaste tu contraseña.' });
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const datos = perfil && [
    ['Nombre', perfil.nombre],
    ['Correo', perfil.usuario],
    ['Rol', NOMBRE_ROL[perfil.role] ?? perfil.role],
    ['Instituto', perfil.instituto ?? 'Sin instituto asignado'],
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mi cuenta</h1>
        <p className={styles.subtitle}>Tus datos de acceso y la seguridad de tu cuenta</p>
      </header>

      <section className={styles.card} aria-labelledby={`${idForm}-datos`}>
        <h2 id={`${idForm}-datos`} className={styles.cardTitle}>Datos de la cuenta</h2>
        {errorCarga ? (
          <p className={styles.errorCarga} role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            <span>{errorCarga}</span>
            <button type="button" className={styles.secundario} onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </p>
        ) : !perfil ? (
          <p className={styles.cargando}>Cargando…</p>
        ) : (
          <dl className={styles.datos}>
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className={styles.dato}>
                <dt>{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className={styles.card} aria-labelledby={`${idForm}-password`}>
        <h2 id={`${idForm}-password`} className={styles.cardTitle}>Contraseña</h2>
        {!formAbierto ? (
          <div className={styles.filaPassword}>
            <p className={styles.texto}>
              Para cambiarla te pedimos la contraseña actual. Si la olvidaste, cerrá la sesión y usá
              «Recuperar contraseña» en el ingreso.
            </p>
            <button type="button" className={styles.primario} onClick={() => setFormAbierto(true)}>
              <KeyRound size={16} aria-hidden="true" />
              Cambiar contraseña
            </button>
          </div>
        ) : (
          <form className={styles.form} noValidate onSubmit={enviar}>
            <Campo
              id={`${idForm}-actual`} etiqueta="Contraseña actual" tipo="password"
              valor={campos.actual} onChange={cambiar('actual')} onBlur={marcar('actual')}
              error={errores.actual} tocado={tocados.actual}
              autoComplete="current-password" disabled={enviando} autoFocus
            />
            <Campo
              id={`${idForm}-nueva`} etiqueta="Contraseña nueva" tipo="password"
              valor={campos.nueva} onChange={cambiar('nueva')} onBlur={marcar('nueva')}
              error={errores.nueva} tocado={tocados.nueva}
              autoComplete="new-password" disabled={enviando}
            >
              <ReglasPassword password={campos.nueva} />
            </Campo>
            <Campo
              id={`${idForm}-confirmacion`} etiqueta="Repetí la contraseña nueva" tipo="password"
              valor={campos.confirmacion} onChange={cambiar('confirmacion')} onBlur={marcar('confirmacion')}
              error={errores.confirmacion} tocado={tocados.confirmacion}
              autoComplete="new-password" disabled={enviando}
            />
            {errorEnvio && (
              <p className={styles.errorEnvio} role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <span>{errorEnvio}</span>
              </p>
            )}
            <div className={styles.acciones}>
              <button type="submit" className={styles.primario} disabled={enviando}>
                {enviando ? 'Guardando…' : 'Guardar contraseña'}
              </button>
              <button type="button" className={styles.secundario} onClick={cerrarForm} disabled={enviando}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default Cuenta;
