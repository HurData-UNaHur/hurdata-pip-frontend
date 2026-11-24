import { useId, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import styles from './AyudaPantalla.module.css';
import { AYUDA } from '../utils/ayuda';

/*
 * "¿Cómo se lee?": un panel que se abre y se cierra con un botón, con una explicación corta
 * de la pantalla. Arranca siempre cerrado. Se despliega con una transición de altura; cerrado
 * queda con visibility:hidden, así que no se lee ni se enfoca.
 *   pantalla: 'dashboard' | 'materias' | 'predicciones' | 'evolucion' (ver utils/ayuda.js)
 */
export default function AyudaPantalla({ pantalla }) {
  const idPanel = useId();
  const contenido = AYUDA[pantalla];
  const [abierto, setAbierto] = useState(false);

  if (!contenido) return null;

  return (
    <div className={styles.ayuda}>
      <button
        type="button"
        className={abierto ? `${styles.boton} ${styles.botonAbierto}` : styles.boton}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((v) => !v)}
      >
        <CircleHelp size={16} aria-hidden="true" />
        ¿Cómo se lee?
      </button>

      <div className={abierto ? `${styles.envoltorio} ${styles.envoltorioAbierto}` : styles.envoltorio}>
        <section id={idPanel} className={styles.panel} aria-label="Cómo se lee esta pantalla">
          <div className={styles.contenido}>
            <p className={styles.intro}>{contenido.intro}</p>
            <div className={styles.bloques}>
              {contenido.bloques.map((b) => (
                <div key={b.titulo} className={styles.bloque}>
                  <h2 className={styles.titulo}>{b.titulo}</h2>
                  <ul>
                    {b.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
