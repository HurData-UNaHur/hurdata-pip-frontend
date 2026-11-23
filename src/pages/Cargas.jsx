import { useEffect, useRef, useState } from 'react';
import { CircleCheck, CloudUpload, FileSpreadsheet, Info, TriangleAlert } from 'lucide-react';
import styles from './Cargas.module.css';
import Tooltip from '../components/Tooltip';
import ModalConfirmar from '../components/ModalConfirmar';
import {
  getCargas, uploadSiuExcel, deletePeriodo, resetDatabase, PERMISOS, tienePermiso,
} from '../services/api';
import { formatearFechaCorta, formatearPeriodo, plural } from '../utils/texto';

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'activa', label: 'Activas' },
  { value: 'reemplazada', label: 'Reemplazadas' },
  { value: 'borrada', label: 'Borradas' },
];

const BADGE_POR_ESTADO = {
  activa: { clase: styles.badgeActiva, texto: 'Activa' },
  reemplazada: { clase: styles.badgeReemplazada, texto: 'Reemplazada' },
  borrada: { clase: styles.badgeBorrada, texto: 'Borrada' },
};

// Fechas del backend (UTC) en hora local y en una línea: '18/11/26 19:14'
const formatearFecha = formatearFechaCorta;

// Texto del resultado de una subida (resumen que devuelve POST /upload)
const textoResumen = (r = {}) =>
  `${formatearPeriodo(r.periodo)} · ${r.nombre_carrera} · ` +
  `${plural(r.actividades_cargadas ?? 0, 'materia', 'materias')}, ` +
  `${plural(r.comisiones_cargadas ?? 0, 'comisión', 'comisiones')}.`;

const avisoOmitidas = (r = {}) => {
  const omitidas = r.actividades_omitidas || [];
  return omitidas.length > 0
    ? `No se cargaron ${plural(omitidas.length, 'actividad', 'actividades')} sin código: ${omitidas.join(', ')}.`
    : null;
};

const TEXTO_ESTADO_BAJA = { reemplazada: 'Reemplazada', borrada: 'Borrada' };

// Ícono delante de los mensajes de resultado: verde si salió bien, rojo si no
const IconoResultado = ({ ok }) => (ok
  ? <CircleCheck size={15} color="#16a34a" className="icono-inline" aria-hidden="true" />
  : <TriangleAlert size={15} color="#ef4444" className="icono-inline" aria-hidden="true" />);

/*
 * Página Cargas: todo lo relacionado con los Excel del SIU.
 *   1. Subir un Excel                      (permiso datos:cargar)
 *   2. Historial, con Borrar por carga activa (regla de dueño: lo decide el backend)
 *   3. Zona de peligro: resetear la DB     (permiso db:resetear, solo Admin)
 *
 * Admin y Directivo ven todas las cargas; el Docente solo las suyas.
 *
 * onUploadSuccess: refresca períodos y datos del dashboard (App.jsx).
 * onDatosBorrados: vuelve a cargar todo después de borrar o resetear (App.jsx).
 */
function Cargas({ usuario, onUploadSuccess, onDatosBorrados }) {
  const puedeCargar = tienePermiso(usuario, PERMISOS.CARGAR);
  const puedeResetear = tienePermiso(usuario, PERMISOS.RESETEAR_DB);

  // ── Historial ────────────────────────────────────────────────────────────
  const [estado, setEstado] = useState('');
  const [cargas, setCargas] = useState([]);
  const [veTodas, setVeTodas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0); // se incrementa para volver a pedir el historial

  // ── Subida ───────────────────────────────────────────────────────────────
  const [archivo, setArchivo] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok: bool, texto: string, aviso?: string }
  const inputArchivo = useRef(null);

  // Acción en curso (nueva versión, borrar o resetear): deshabilita los botones mientras tanto
  const [ocupado, setOcupado] = useState(false);

  // ── Acciones por fila del historial ──────────────────────────────────────
  const [filaNuevaVersion, setFilaNuevaVersion] = useState(null); // carga a reemplazar
  const [confirmacion, setConfirmacion] = useState(null);       // acción que espera confirmación
  const [resultadoAccion, setResultadoAccion] = useState(null);   // { ok, texto, aviso? }
  const inputNuevaVersion = useRef(null);

  useEffect(() => {
    let cancelado = false;
    getCargas(estado || null)
      .then((data) => {
        if (cancelado) return;
        setCargas(data.cargas || []);
        setVeTodas(Boolean(data.ve_todas));
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setCargas([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => { cancelado = true; };
  }, [estado, recargar]);

  const recargarHistorial = () => {
    setLoading(true);
    setRecargar((n) => n + 1);
  };

  const handleCambiarEstado = (e) => {
    setLoading(true);
    setEstado(e.target.value);
  };

  // ── Subida: elegir o arrastrar el archivo ────────────────────────────────
  const elegirArchivo = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setArchivo(null);
      setResultado({ ok: false, texto: 'Solo se aceptan archivos .xlsx del SIU Guaraní.' });
      return;
    }
    setArchivo(file);
    setResultado(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (!procesando) elegirArchivo(e.dataTransfer.files?.[0]);
  };

  const handleProcesar = async () => {
    if (!archivo) return;
    setProcesando(true);
    setResultado(null);
    try {
      const data = await uploadSiuExcel(archivo);
      setResultado({
        ok: true,
        texto: `Archivo procesado: ${textoResumen(data.resumen)}`,
        aviso: avisoOmitidas(data.resumen),
      });
      setArchivo(null);
      if (inputArchivo.current) inputArchivo.current.value = '';
      if (onUploadSuccess) onUploadSuccess(data);
      recargarHistorial();
    } catch (err) {
      setResultado({ ok: false, texto: err.message });
    } finally {
      setProcesando(false);
    }
  };

  // ── Nueva versión de una carga activa ────────────────────────────────────
  // El botón abre el selector de archivo; el backend rechaza el Excel si no es
  // del mismo período y carrera que la carga elegida.
  const elegirNuevaVersion = (c) => {
    setFilaNuevaVersion(c);
    setResultadoAccion(null);
    if (inputNuevaVersion.current) {
      inputNuevaVersion.current.value = '';
      inputNuevaVersion.current.click();
    }
  };

  // Las tres acciones que modifican datos piden confirmación con un modal propio.
  // `confirmacion` guarda qué se está por hacer; ejecutar* corre la acción ya confirmada.
  const handleNuevaVersion = (file) => {
    const c = filaNuevaVersion;
    if (!file || !c) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setResultadoAccion({ ok: false, texto: 'Solo se aceptan archivos .xlsx del SIU Guaraní.' });
      return;
    }
    setConfirmacion({ tipo: 'nueva-version', carga: c, archivo: file });
  };

  const ejecutarNuevaVersion = async (file, c) => {
    setOcupado(true);
    setResultadoAccion(null);
    try {
      const data = await uploadSiuExcel(file, c.id_carga);
      setResultadoAccion({
        ok: true,
        texto: `Nueva versión cargada: ${textoResumen(data.resumen)}`,
        aviso: avisoOmitidas(data.resumen),
      });
      if (onUploadSuccess) onUploadSuccess(data);
      recargarHistorial();
    } catch (err) {
      setResultadoAccion({ ok: false, texto: err.message });
    } finally {
      setOcupado(false);
      setFilaNuevaVersion(null);
    }
  };

  // ── Borrar una carga activa ──────────────────────────────────────────────
  const handleBorrar = (c) => setConfirmacion({ tipo: 'borrar', carga: c });

  const ejecutarBorrado = async (c) => {
    setOcupado(true);
    setError(null);
    setResultadoAccion(null);
    try {
      await deletePeriodo(c.id_periodo, c.id_carrera);
      if (onDatosBorrados) onDatosBorrados(); // App vuelve a cargar períodos y datos
      recargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  // ── Resetear la DB (solo Admin) ──────────────────────────────────────────
  const handleResetear = () => setConfirmacion({ tipo: 'resetear' });

  const ejecutarReset = async () => {
    setOcupado(true);
    setError(null);
    try {
      await resetDatabase();
      if (onDatosBorrados) onDatosBorrados();
      recargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const confirmar = () => {
    const pedido = confirmacion;
    setConfirmacion(null);
    if (pedido.tipo === 'nueva-version') ejecutarNuevaVersion(pedido.archivo, pedido.carga);
    else if (pedido.tipo === 'borrar') ejecutarBorrado(pedido.carga);
    else ejecutarReset();
  };

  const cancelarConfirmacion = () => {
    if (confirmacion?.tipo === 'nueva-version') setFilaNuevaVersion(null);
    setConfirmacion(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cargas</h1>
        <p className={styles.subtitle}>
          Subí los Excel de fin de cursada del SIU y consultá el historial de lo cargado.
        </p>
      </header>

      {/* ── 1. Subir Excel ── */}
      {puedeCargar && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Subir Excel del SIU</h2>
          <div
            className={`${styles.dropzone} ${arrastrando ? styles.dropzoneActiva : ''}`}
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={handleDrop}
            onClick={() => !procesando && inputArchivo.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !procesando) {
                e.preventDefault();
                inputArchivo.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Elegir archivo .xlsx"
          >
            {archivo ? (
              <span>
                <FileSpreadsheet size={16} className="icono-inline" aria-hidden="true" />
                <strong>{archivo.name}</strong>, hacé clic para cambiarlo
              </span>
            ) : (
              <span className={styles.dropzoneTexto}>
                <CloudUpload size={28} aria-hidden="true" />
                Arrastrá el archivo <code>.xlsx</code> acá o hacé clic para elegirlo
              </span>
            )}
            <input
              ref={inputArchivo}
              type="file"
              accept=".xlsx"
              className={styles.inputOculto}
              onChange={(e) => elegirArchivo(e.target.files?.[0])}
              disabled={procesando}
            />
          </div>
          <div className={styles.acciones}>
            <small className={styles.ayuda}>
              Si el período y la carrera ya estaban cargados, se reemplazan
              (solo si los cargaste vos, o si sos directivo).
            </small>
            <button
              type="button"
              className={styles.btnPrimario}
              onClick={handleProcesar}
              disabled={!archivo || procesando}
            >
              {procesando ? 'Procesando...' : 'Procesar archivo'}
            </button>
          </div>
          {resultado && (
            <div className={resultado.ok ? styles.msgOk : styles.msgError}>
              <p><IconoResultado ok={resultado.ok} />{resultado.texto}</p>
              {resultado.aviso && <p className={styles.msgAviso}>{resultado.aviso}</p>}
            </div>
          )}
        </section>
      )}

      {/* ── 2. Historial ── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Historial de cargas</h2>
            <p className={styles.subtitle}>
              {veTodas
                ? 'Todos los Excel cargados en el sistema, incluidos los reemplazados y borrados.'
                : 'Los Excel que cargaste, incluidos los reemplazados y borrados.'}
            </p>
          </div>
          <div className={styles.toolbar}>
            <label htmlFor="filtro-estado">Estado</label>
            <select id="filtro-estado" className={styles.select} value={estado} onChange={handleCambiarEstado}>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className={styles.error}><IconoResultado ok={false} />{error}</p>}

        {resultadoAccion && (
          <div className={resultadoAccion.ok ? styles.msgOk : styles.msgError}>
            <p><IconoResultado ok={resultadoAccion.ok} />{resultadoAccion.texto}</p>
            {resultadoAccion.aviso && <p className={styles.msgAviso}>{resultadoAccion.aviso}</p>}
          </div>
        )}

        {/* Selector de archivo de 'Nueva versión' (lo abre el botón de cada fila) */}
        <input
          ref={inputNuevaVersion}
          type="file"
          accept=".xlsx"
          className={styles.inputOculto}
          onChange={(e) => handleNuevaVersion(e.target.files?.[0])}
        />

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Archivo</th>
                <th>Cargado por</th>
                <th>Período</th>
                <th>Carrera</th>
                <th>Contenido</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Filas grises mientras llega el historial
                [0, 1, 2].map((i) => (
                  <tr key={`sk-${i}`} aria-hidden="true">
                    <td colSpan={9}><div className={`skeleton ${styles.skFila}`} /></td>
                  </tr>
                ))
              ) : cargas.length === 0 ? (
                <tr><td colSpan={9} className={styles.vacio}>No hay cargas para mostrar.</td></tr>
              ) : (
                cargas.map((c) => {
                  const badge = BADGE_POR_ESTADO[c.estado] || { clase: styles.badge, texto: c.estado };
                  // Reemplazada o borrada: quién y cuándo, en el tooltip del ícono (i)
                  const infoBaja = c.estado !== 'activa'
                    ? `${TEXTO_ESTADO_BAJA[c.estado] || badge.texto} por ${c.dado_de_baja_por || '—'} · ` +
                      formatearFecha(c.fecha_baja)
                    : null;
                  return (
                    <tr key={c.id_carga}>
                      <td>{c.id_carga}</td>
                      <td className={styles.sinCorte}>{formatearFecha(c.fecha)}</td>
                      <td>{c.nombre_archivo}</td>
                      <td>{c.cargado_por}</td>
                      <td className={styles.sinCorte}>{formatearPeriodo(c.periodo_label)}</td>
                      <td>{c.nombre_carrera}</td>
                      <td>
                        {plural(c.materias, 'materia', 'materias')}
                        <span className={styles.detalle}>
                          {plural(c.comisiones, 'comisión', 'comisiones')} · {plural(c.resultados, 'resultado', 'resultados')}
                        </span>
                      </td>
                      <td className={styles.sinCorte}>
                        <span className={badge.clase}>{badge.texto}</span>
                        {infoBaja && (
                          <span className={styles.info} tabIndex={0} aria-label={infoBaja} data-tooltip={infoBaja}>
                            <Info size={15} aria-hidden="true" />
                          </span>
                        )}
                      </td>
                      <td className={styles.sinCorte}>
                        {c.puede_borrar && (
                          <div className={styles.accionesFila}>
                            {puedeCargar && (
                              <Tooltip texto="Subir un Excel corregido de este mismo período y carrera">
                                <button
                                  type="button"
                                  className={styles.btnAccion}
                                  onClick={() => elegirNuevaVersion(c)}
                                  disabled={ocupado || procesando}
                                >
                                  Nueva versión
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip texto="Borrar estos datos del dashboard">
                              <button
                                type="button"
                                className={`${styles.btnAccion} ${styles.btnBorrar}`}
                                onClick={() => handleBorrar(c)}
                                disabled={ocupado || procesando}
                              >
                                Borrar
                              </button>
                            </Tooltip>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Zona de peligro (solo Admin) ── */}
      {puedeResetear && (
        <section className={`${styles.card} ${styles.zonaPeligro}`}>
          <h2 className={styles.cardTitle}>Zona de peligro</h2>
          <div className={styles.acciones}>
            <p className={styles.ayuda}>
              <strong>Resetear la base de datos:</strong> borra todos los datos cargados de todos
              los períodos y carreras. El historial de cargas se conserva.
            </p>
            <button
              type="button"
              className={styles.btnPeligro}
              onClick={handleResetear}
              disabled={ocupado || procesando}
            >
              Resetear DB
            </button>
          </div>
        </section>
      )}
      {/* ── Confirmación de las acciones que modifican datos ── */}
      {confirmacion?.tipo === 'nueva-version' && (
        <ModalConfirmar
          titulo="Reemplazar los datos"
          textoConfirmar="Reemplazar"
          onConfirmar={confirmar}
          onCancelar={cancelarConfirmacion}
        >
          <p>
            Vas a reemplazar los datos de{' '}
            <strong>{formatearPeriodo(confirmacion.carga.periodo_label)}, {confirmacion.carga.nombre_carrera}</strong>{' '}
            con el archivo <strong>{confirmacion.archivo.name}</strong>.
          </p>
          <p>La carga actual queda como "Reemplazada" en el historial.</p>
        </ModalConfirmar>
      )}
      {confirmacion?.tipo === 'borrar' && (
        <ModalConfirmar
          titulo="Borrar estos datos"
          textoConfirmar="Borrar"
          peligro
          onConfirmar={confirmar}
          onCancelar={cancelarConfirmacion}
        >
          <p>
            Se eliminan del dashboard los datos de{' '}
            <strong>{formatearPeriodo(confirmacion.carga.periodo_label)}, {confirmacion.carga.nombre_carrera}</strong>.
          </p>
          <p>En el historial la carga queda como "Borrada".</p>
        </ModalConfirmar>
      )}
      {confirmacion?.tipo === 'resetear' && (
        <ModalConfirmar
          titulo="Borrar todos los datos"
          textoConfirmar="Borrar todo"
          peligro
          palabraClave="BORRAR"
          onConfirmar={confirmar}
          onCancelar={cancelarConfirmacion}
        >
          <p>La base de datos queda vacía: se pierden los datos de todos los períodos y carreras.</p>
          <p>El historial de cargas se conserva. Esta acción no se puede deshacer.</p>
        </ModalConfirmar>
      )}
    </div>
  );
}

export default Cargas;
