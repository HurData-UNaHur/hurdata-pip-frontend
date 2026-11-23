import { useEffect, useRef } from 'react';
import styles from './Dialogo.module.css';

/*
 * Ventana modal con <dialog> nativo: el foco queda atrapado adentro, Escape la cierra y el
 * resto de la página queda bloqueado. Se monta solo cuando está abierta (el padre la renderiza o no).
 *
 *   labelledBy: id del título de la ventana, para que los lectores de pantalla la anuncien
 *   onCerrar:   se llama con Escape o con un clic sobre el fondo
 * El diseño de la tarjeta lo pone quien la usa; esto solo se ocupa del comportamiento.
 */
export default function Dialogo({ labelledBy, onCerrar, children }) {
  const dialogo = useRef(null);

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    return () => { if (d?.open) d.close(); };
  }, []);

  return (
    // El clic sobre el fondo es un atajo para el mouse; con teclado se cierra con Escape (evento "cancel")
    <dialog
      ref={dialogo}
      className={styles.dialogo}
      aria-labelledby={labelledBy}
      onCancel={(e) => { e.preventDefault(); onCerrar(); }}
      onClick={(e) => { if (e.target === dialogo.current) onCerrar(); }}
    >
      {children}
    </dialog>
  );
}
