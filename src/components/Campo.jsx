import { useState } from 'react';
import { Check, Circle, Eye, EyeOff } from 'lucide-react';
import styles from '../pages/Login.module.css';
import { REGLAS_PASSWORD } from '../utils/validaciones';

/*
 * Campo de formulario de acceso: etiqueta, input y mensaje de error.
 * El error se muestra solo si el campo ya se tocó (salió del campo o se intentó enviar);
 * desde ahí se actualiza mientras se escribe. Si tipo es "password", suma el ojo para ver la clave.
 */
export default function Campo({
  id, etiqueta, valor, onChange, onBlur, error, tocado, tipo = 'text', ayuda, children, ...resto
}) {
  const [visible, setVisible] = useState(false);
  const esPassword = tipo === 'password';
  const mensaje = tocado && error ? error : '';
  const idMensaje = `${id}-mensaje`;

  return (
    <div className={styles.campo}>
      <label htmlFor={id}>{etiqueta}</label>
      <div className={esPassword ? styles.conBoton : undefined}>
        <input
          id={id}
          type={esPassword && visible ? 'text' : tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={mensaje ? 'true' : undefined}
          aria-describedby={mensaje ? idMensaje : undefined}
          className={mensaje ? styles.inputError : undefined}
          {...resto}
        />
        {esPassword && (
          <button
            type="button"
            className={styles.ojo}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
            aria-pressed={visible}
            disabled={resto.disabled}
          >
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {mensaje && <p id={idMensaje} className={styles.errorCampo} role="alert">{mensaje}</p>}
      {ayuda && !mensaje && <p className={styles.ayudaCampo}>{ayuda}</p>}
      {children}
    </div>
  );
}

/* Checklist de requisitos de la contraseña nueva; se tilda a medida que se cumplen */
export function ReglasPassword({ password }) {
  return (
    <ul className={styles.reglas} aria-label="Requisitos de la contraseña">
      {REGLAS_PASSWORD.map((regla) => {
        const ok = regla.cumple(password);
        return (
          <li key={regla.id} className={ok ? styles.reglaOk : undefined}>
            {ok ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            <span>{regla.texto}</span>
            <span className={styles.soloLector}>{ok ? ' (cumplido)' : ' (falta)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
