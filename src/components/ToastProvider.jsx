import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import styles from './ToastProvider.module.css';
import { ContextoToast } from './contextoToast';

const DURACION_POR_DEFECTO = 5000; // los de error no se van solos
const MAXIMO_VISIBLES = 4;

const ICONOS = { exito: CircleCheck, error: TriangleAlert, info: Info };

function Aviso({ aviso, onCerrar }) {
  const [pausado, setPausado] = useState(false);
  const Icono = ICONOS[aviso.tipo] ?? Info;
  const duracion = aviso.duracion ?? (aviso.tipo === 'error' ? null : DURACION_POR_DEFECTO);

  // Se va solo, salvo que tenga duración nula o el mouse (o el foco) esté encima
  useEffect(() => {
    if (!duracion || pausado) return undefined;
    const temporizador = setTimeout(onCerrar, duracion);
    return () => clearTimeout(temporizador);
  }, [duracion, pausado, onCerrar]);

  return (
    <div
      className={`${styles.aviso} ${styles[aviso.tipo] ?? ''}`}
      role={aviso.tipo === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <Icono size={18} className={styles.icono} aria-hidden="true" />
      <p className={styles.texto}>{aviso.texto}</p>
      <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar aviso">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/* Guarda los avisos y los dibuja arriba a la derecha. Va por encima de la app (ver App.jsx). */
export default function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const siguiente = useRef(1);
  const contenedor = useRef(null);

  const cerrar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), []);

  const avisar = useCallback(({ tipo = 'info', texto, duracion }) => {
    if (!texto) return null;
    const id = siguiente.current++;
    setAvisos((lista) => [...lista, { id, tipo, texto, duracion }].slice(-MAXIMO_VISIBLES));
    return id;
  }, []);

  const valor = useMemo(() => ({ avisar, cerrar }), [avisar, cerrar]);

  // Los avisos van en la capa superior del navegador (popover), como las ventanas modales. Cada vez
  // que cambia la lista se vuelve a abrir, así queda por encima de una ventana que se abrió después
  // (por ejemplo, el aviso de "solicitud aprobada" con la ventana de solicitudes todavía abierta).
  useEffect(() => {
    const el = contenedor.current;
    if (!el || typeof el.showPopover !== 'function') return;
    try {
      if (el.matches(':popover-open')) el.hidePopover();
      if (avisos.length > 0) el.showPopover();
    } catch {
      // Sin soporte de popover el contenedor se ve igual, con posición fija
    }
  }, [avisos]);

  return (
    <ContextoToast.Provider value={valor}>
      {children}
      {createPortal(
        <div ref={contenedor} popover="manual" className={styles.contenedor}>
          {avisos.map((a) => (
            <Aviso key={a.id} aviso={a} onCerrar={() => cerrar(a.id)} />
          ))}
        </div>,
        document.body,
      )}
    </ContextoToast.Provider>
  );
}
