import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import logoUnahur from '../assets/logo-hurlingham.png';
import IconoTema from './IconoTema';
import Tooltip from './Tooltip';
import styles from '../pages/Login.module.css';

/*
 * Fotos del panel izquierdo: todas las imágenes de src/assets/loguin, en orden alfabético por nombre.
 * Para sumar o sacar una foto alcanza con agregar o borrar el archivo; no hay que tocar el código.
 */
const FOTOS = Object.entries(
  import.meta.glob('../assets/loguin/*.{jpg,jpeg,jfif,png,webp,avif}', { eager: true, query: '?url', import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const SEGUNDOS_POR_FOTO = 6;

// Cada foto se mueve en una dirección distinta (efecto Ken Burns): desplazamiento final en %
const MOVIMIENTOS = [
  ['-2%', '-1.5%'],
  ['2%', '-1%'],
  ['-1.5%', '1.5%'],
  ['1.5%', '1%'],
];

/*
 * Marco de las pantallas de acceso (Login, Registro, Recuperar contraseña): barra institucional,
 * identidad del sistema a la izquierda y, a la derecha, el formulario que llega como children.
 * A la izquierda, las fotos se alternan con fundido y un zoom lento. Quien prefiere menos movimiento la
 * ve quieta, y el botón de pausa permite frenarla o reanudarla.
 */
export default function AuthLayout({ theme, toggleTheme, children }) {
  const hayFotos = FOTOS.length > 0;
  const variasFotos = FOTOS.length > 1;
  const [pausada, setPausada] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [{ actual, anterior }, setFoto] = useState({ actual: 0, anterior: null });
  // La primera foto se pide sola y con prioridad; las demás recién cuando ella terminó de cargar,
  // así no compiten con ella por la conexión. El cambio de fotos empieza en ese momento.
  const [primeraLista, setPrimeraLista] = useState(false);

  useEffect(() => {
    if (!variasFotos || pausada || !primeraLista) return undefined;
    const reloj = setInterval(
      () => setFoto((f) => ({ actual: (f.actual + 1) % FOTOS.length, anterior: f.actual })),
      SEGUNDOS_POR_FOTO * 1000,
    );
    return () => clearInterval(reloj);
  }, [variasFotos, pausada, primeraLista]);

  const claseFoto = (i) => {
    if (i === actual) return `${styles.foto} ${styles.fotoActiva}`;
    if (i === anterior) return `${styles.foto} ${styles.fotoSaliente}`;
    return styles.foto;
  };

  return (
    <div className={styles.pagina}>
      {/* Barra institucional con los cuatro colores de la UNaHur */}
      <div className={styles.barra} aria-hidden="true" />
      <Tooltip texto="Cambiar tema">
        <button
          type="button"
          className={styles.temaBtn}
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          <IconoTema theme={theme} />
        </button>
      </Tooltip>

      <aside className={hayFotos ? `${styles.identidad} ${styles.conFotos}` : styles.identidad}>
        {hayFotos && (
          <div className={styles.galeria} aria-hidden="true">
            {FOTOS.map((url, i) => (i === 0 || primeraLista) && (
              <img
                key={url}
                src={url}
                alt=""
                className={claseFoto(i)}
                style={{ '--dx': MOVIMIENTOS[i % MOVIMIENTOS.length][0], '--dy': MOVIMIENTOS[i % MOVIMIENTOS.length][1] }}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
                onLoad={i === 0 ? () => setPrimeraLista(true) : undefined}
              />
            ))}
            <div className={styles.velo} />
          </div>
        )}

        {/* Sin sesión, el logo recarga la página y vuelve al inicio de sesión */}
        <a href="/" className={styles.logoEnlace} aria-label="Volver al inicio de sesión">
          <span className={hayFotos ? styles.logoFicha : styles.logoSolo}>
            <img src={logoUnahur} alt="UNaHur, Universidad Nacional de Hurlingham" className={styles.logo} />
          </span>
        </a>

        <div className={styles.titulos}>
          <p className={styles.titulo}>HurData: Dashboard Analítico de Gestión Académica</p>
          <p className={styles.subtitulo}>Universidad Nacional de Hurlingham</p>
        </div>

        {variasFotos && (
          <div className={styles.controlesFotos}>
            {/* Indicador de cuál es la foto actual: decorativo, no lo leen los lectores de pantalla */}
            <div className={styles.puntos} aria-hidden="true">
              {FOTOS.map((url, i) => (
                <span key={url} className={i === actual ? `${styles.punto} ${styles.puntoActivo}` : styles.punto} />
              ))}
            </div>
            <Tooltip texto={pausada ? 'Reanudar las fotos' : 'Pausar las fotos'}>
              <button
                type="button"
                className={styles.pausaFotos}
                onClick={() => setPausada((p) => !p)}
                aria-label={pausada ? 'Reanudar el cambio de fotos' : 'Pausar el cambio de fotos'}
                aria-pressed={pausada}
              >
                {pausada ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            </Tooltip>
          </div>
        )}
      </aside>

      <main className={styles.panelForm}>{children}</main>
    </div>
  );
}
