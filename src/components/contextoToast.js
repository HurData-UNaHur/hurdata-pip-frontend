import { createContext, useContext } from 'react';

/*
 * Avisos breves de resultado ("toasts"). Se usan así, desde cualquier componente:
 *
 *   const { avisar } = useToast();
 *   avisar({ tipo: 'exito', texto: 'Se descargó materias.csv' });
 *
 * tipo: 'exito' | 'error' | 'info'. Los de éxito e info se van solos a los 5 segundos;
 * los de error se quedan hasta que se cierran. `duracion` (ms) cambia ese tiempo.
 */
export const ContextoToast = createContext({ avisar: () => {}, cerrar: () => {} });

export const useToast = () => useContext(ContextoToast);
