import { useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Gestion.module.css';
import { usePendientes } from '../components/contextoPendientes';
import { PERMISOS, tienePermiso } from '../services/api';
import PestanaCuentas from './accesos/PestanaCuentas';
import PestanaHistorial from './accesos/PestanaHistorial';
import PestanaSolicitudes from './accesos/PestanaSolicitudes';

/*
 * Accesos: todo lo que tiene que ver con quién puede entrar al sistema, en tres pestañas.
 *   Solicitudes  pedidos de registro y de recuperación de contraseña pendientes (Admin y Directivo)
 *   Historial    solicitudes ya resueltas                                       (Admin y Directivo)
 *   Cuentas      cambiar rol, revocar y reactivar el acceso                      (solo Admin)
 * La pestaña activa va en la URL (?pestana=historial), así la barra lateral y los enlaces pueden apuntar a una.
 */
function Accesos({ usuario }) {
  const idBase = useId();
  const { pendientes } = usePendientes();
  const [params, setParams] = useSearchParams();
  const refTabs = useRef({});
  // Los códigos de recuperación recién generados viven acá para no perderse al cambiar de pestaña
  const [codigos, setCodigos] = useState([]);

  const pestanas = [
    ...(tienePermiso(usuario, PERMISOS.APROBAR_REGISTROS)
      ? [{ id: 'solicitudes', texto: 'Solicitudes', contador: pendientes + codigos.length },
         { id: 'historial', texto: 'Historial' }]
      : []),
    ...(tienePermiso(usuario, PERMISOS.GESTIONAR_USUARIOS) ? [{ id: 'cuentas', texto: 'Cuentas' }] : []),
  ];
  const activa = pestanas.find((p) => p.id === params.get('pestana')) ?? pestanas[0];

  const elegir = (id) => setParams({ pestana: id }, { replace: true });

  // Navegación con flechas, Inicio y Fin (patrón de pestañas de WAI-ARIA)
  const alTeclear = (e, indice) => {
    const salto = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    let destino;
    if (salto) destino = (indice + salto + pestanas.length) % pestanas.length;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = pestanas.length - 1;
    else return;
    e.preventDefault();
    elegir(pestanas[destino].id);
    refTabs.current[pestanas[destino].id]?.focus();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Accesos</h1>
        <p className={styles.subtitle}>Solicitudes de registro y de recuperación de contraseña, historial y cuentas del sistema</p>
      </header>

      <div className={styles.card}>
        <div role="tablist" aria-label="Secciones de Accesos" className={styles.tabs}>
          {pestanas.map((p, i) => {
            const seleccionada = p.id === activa.id;
            return (
              <button
                key={p.id}
                ref={(el) => { refTabs.current[p.id] = el; }}
                type="button"
                role="tab"
                id={`${idBase}-tab-${p.id}`}
                aria-selected={seleccionada}
                aria-controls={`${idBase}-panel-${p.id}`}
                tabIndex={seleccionada ? 0 : -1}
                className={seleccionada ? `${styles.tab} ${styles.tabActiva}` : styles.tab}
                onClick={() => elegir(p.id)}
                onKeyDown={(e) => alTeclear(e, i)}
              >
                {p.texto}
                {p.contador > 0 && <span className={styles.contador}>{p.contador}</span>}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${idBase}-panel-${activa.id}`}
          aria-labelledby={`${idBase}-tab-${activa.id}`}
          className={styles.panelPestana}
        >
          {activa.id === 'solicitudes' && <PestanaSolicitudes codigos={codigos} setCodigos={setCodigos} />}
          {activa.id === 'historial' && <PestanaHistorial />}
          {activa.id === 'cuentas' && <PestanaCuentas usuario={usuario} />}
        </div>
      </div>
    </div>
  );
}

export default Accesos;
