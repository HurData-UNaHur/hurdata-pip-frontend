import { useEffect, useId, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import styles from './ModalConfirmar.module.css';

/*
 * Ventana de confirmación para acciones que modifican datos. Reemplaza al confirm() del navegador.
 * Se monta solo cuando hay algo que confirmar (el padre la renderiza o no) y usa <dialog>, que ya
 * trae el foco atrapado, el cierre con Escape y el fondo que bloquea el resto de la página.
 *
 *   titulo, children:  qué se va a hacer, con sus consecuencias
 *   textoConfirmar:    el verbo de la acción ("Borrar", "Reemplazar"), nunca "Aceptar"
 *   peligro:           botón rojo para acciones que no se pueden deshacer
 *   palabraClave:      si se indica, hay que escribirla para habilitar el botón (acciones irreversibles)
 */
export default function ModalConfirmar({
  titulo, children, textoConfirmar, peligro = false, palabraClave, onConfirmar, onCancelar,
}) {
  const idTitulo = useId();
  const dialogo = useRef(null);
  const [escrito, setEscrito] = useState('');
  const habilitado = !palabraClave || escrito.trim().toUpperCase() === palabraClave.toUpperCase();

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    return () => { if (d?.open) d.close(); };
  }, []);

  const alHacerClic = (e) => {
    // Un clic sobre el fondo (el propio <dialog>, fuera de la tarjeta) cancela
    if (e.target === dialogo.current) onCancelar();
  };
  const alEnviar = (e) => {
    e.preventDefault();
    if (habilitado) onConfirmar();
  };

  return (
    <dialog
      ref={dialogo}
      className={styles.dialogo}
      aria-labelledby={idTitulo}
      onCancel={(e) => { e.preventDefault(); onCancelar(); }}
      onClick={alHacerClic}
    >
      <form className={styles.tarjeta} onSubmit={alEnviar}>
        <h2 id={idTitulo} className={styles.titulo}>
          {peligro && <TriangleAlert size={20} aria-hidden="true" />}
          {titulo}
        </h2>
        <div className={styles.cuerpo}>{children}</div>

        {palabraClave && (
          <label className={styles.palabra}>
            <span>Escribí <strong>{palabraClave}</strong> para confirmar</span>
            <input
              type="text"
              value={escrito}
              onChange={(e) => setEscrito(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </label>
        )}

        <div className={styles.acciones}>
          <button type="button" className={styles.cancelar} onClick={onCancelar} autoFocus={!palabraClave}>
            Cancelar
          </button>
          <button
            type="submit"
            className={peligro ? `${styles.confirmar} ${styles.peligro}` : styles.confirmar}
            disabled={!habilitado}
          >
            {textoConfirmar}
          </button>
        </div>
      </form>
    </dialog>
  );
}
