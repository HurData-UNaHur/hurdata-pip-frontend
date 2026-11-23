import { Children, cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

const MARGEN = 8;     // distancia mínima al borde de la ventana
const SEPARACION = 8; // distancia entre el elemento y el globo

/*
 * Globo de ayuda que reemplaza al `title` del navegador: aparece con el mouse (con una pequeña
 * demora) y con el teclado (al instante), y se cierra con Escape, al salir o al desplazar la página.
 *
 *   <Tooltip texto="Descargar la tabla como PDF"><button>PDF</button></Tooltip>
 *
 * - `children` es un único elemento. Si no es interactivo (un <span>, un <div>), pasá `enfocable`
 *   para que se pueda llegar con el teclado.
 * - Sin `texto` no hace nada y devuelve el elemento tal cual.
 * - El nombre accesible del elemento sigue siendo el suyo (texto o aria-label): el globo lo complementa.
 */
export default function Tooltip({ texto, children, enfocable = false }) {
  const id = useId();
  const globo = useRef(null);
  const [objetivo, setObjetivo] = useState(null); // elemento sobre el que está abierto
  const [origen, setOrigen] = useState('raton');  // 'raton' (con demora) o 'teclado' (inmediato)
  const [posicion, setPosicion] = useState(null);

  const abierto = objetivo !== null && Boolean(texto);

  // Con el globo ya dibujado se mide y se ubica: arriba del elemento, o abajo si no hay lugar
  useLayoutEffect(() => {
    if (!abierto || !globo.current) return;
    const e = objetivo.getBoundingClientRect();
    const g = globo.current.getBoundingClientRect();
    const izquierda = Math.min(
      Math.max(MARGEN, e.left + e.width / 2 - g.width / 2),
      window.innerWidth - g.width - MARGEN,
    );
    const entraArriba = e.top - g.height - SEPARACION >= MARGEN;
    setPosicion({
      left: izquierda,
      top: entraArriba ? e.top - g.height - SEPARACION : e.bottom + SEPARACION,
    });
  }, [abierto, objetivo, texto]);

  // Mientras está abierto: Escape lo cierra, y al desplazar la página se cierra para no quedar flotando
  useEffect(() => {
    if (!abierto) return undefined;
    const cerrar = () => { setObjetivo(null); setPosicion(null); };
    const alTeclear = (ev) => { if (ev.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', alTeclear);
    window.addEventListener('scroll', cerrar, true);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      window.removeEventListener('scroll', cerrar, true);
    };
  }, [abierto]);

  // Misma estructura con y sin texto, así el elemento no se vuelve a montar cuando el texto aparece o se va
  if (!texto) return <>{children}{false}</>;
  const hijo = Children.only(children);

  // Se suman los manejadores a los que el elemento ya tenía, sin pisarlos
  const abrir = (como) => (ev) => { setOrigen(como); setObjetivo(ev.currentTarget); };
  const cerrar = () => { setObjetivo(null); setPosicion(null); };
  const conservar = (nombre, nuevo) => (ev) => { hijo.props[nombre]?.(ev); nuevo(ev); };
  const props = {
    onMouseEnter: conservar('onMouseEnter', abrir('raton')),
    onMouseLeave: conservar('onMouseLeave', cerrar),
    onFocus: conservar('onFocus', abrir('teclado')),
    onBlur: conservar('onBlur', cerrar),
    'aria-describedby': abierto ? id : hijo.props['aria-describedby'],
  };
  if (enfocable && hijo.props.tabIndex === undefined) props.tabIndex = 0;

  return (
    <>
      {cloneElement(hijo, props)}
      {abierto && createPortal(
        <div
          ref={globo}
          id={id}
          role="tooltip"
          className={origen === 'raton' ? `${styles.globo} ${styles.conDemora}` : styles.globo}
          style={posicion ? { left: posicion.left, top: posicion.top } : { left: 0, top: 0, visibility: 'hidden' }}
        >
          {texto}
        </div>,
        // Dentro de una ventana modal el globo tiene que estar en la propia ventana: lo que está fuera
        // de ella queda tapado por el fondo, porque el <dialog> abierto va en la capa superior.
        objetivo.closest('dialog') ?? document.body,
      )}
    </>
  );
}
