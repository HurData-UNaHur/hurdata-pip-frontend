import { useCallback, useEffect, useId, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import styles from './Gestion.module.css';
import ModalConfirmar from '../components/ModalConfirmar';
import { useToast } from '../components/contextoToast';
import { cambiarEstadoUsuario, cambiarRolUsuario, getUsuarios } from '../services/api';

const ROLES = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'directivo', nombre: 'Directivo' },
  { id: 'docente', nombre: 'Docente' },
  { id: 'no_docente', nombre: 'No docente' },
];

/*
 * Usuarios (solo Admin): cambiar el rol, revocar el acceso y reactivarlo.
 * Nadie modifica su propia cuenta (el backend también lo impide), así siempre queda un Admin.
 *   usuario: la sesión actual, para marcar la fila propia
 */
function Usuarios({ usuario }) {
  const { avisar } = useToast();
  const idTitulo = useId();
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState('');          // correo de la fila que se está guardando
  const [porRevocar, setPorRevocar] = useState(null);  // cuenta a confirmar

  const cargar = useCallback(() => {
    getUsuarios()
      .then((datos) => { setLista(datos.usuarios); setError(''); })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const aplicar = async (cuenta, accion, textoExito) => {
    setOcupado(cuenta.usuario);
    try {
      await accion();
      avisar({ tipo: 'exito', texto: textoExito });
    } catch (err) {
      avisar({ tipo: 'error', texto: err.message });
    } finally {
      setOcupado('');
      cargar();   // siempre se vuelve a leer: la fila refleja lo que quedó en el servidor
    }
  };

  const cambiarRol = (cuenta, rol) => aplicar(
    cuenta,
    () => cambiarRolUsuario(cuenta.usuario, rol),
    `${cuenta.nombre} ahora es ${ROLES.find((r) => r.id === rol)?.nombre.toLowerCase()}.`,
  );

  const reactivar = (cuenta) => aplicar(
    cuenta,
    () => cambiarEstadoUsuario(cuenta.usuario, true),
    `Se reactivó el acceso de ${cuenta.nombre}.`,
  );

  const confirmarRevocacion = () => {
    const cuenta = porRevocar;
    setPorRevocar(null);
    aplicar(cuenta, () => cambiarEstadoUsuario(cuenta.usuario, false), `Se revocó el acceso de ${cuenta.nombre}.`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <p className={styles.subtitle}>
          Cambiá el rol de una cuenta o revocá su acceso. Quien tiene el acceso revocado no puede iniciar sesión y
          su sesión abierta se cierra.
        </p>
      </header>

      <section className={styles.card} aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className="sr-only">Lista de usuarios</h2>
        {error ? (
          <p className={styles.error} role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            <span>{error}</span>
            <button type="button" className={styles.boton} onClick={cargar}>Reintentar</button>
          </p>
        ) : !lista ? (
          <p className={styles.mensaje}>Cargando…</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Persona</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Instituto</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acceso</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((cuenta) => {
                  const propia = cuenta.usuario === usuario?.usuario;
                  const guardando = ocupado === cuenta.usuario;
                  return (
                    <tr key={cuenta.usuario} className={cuenta.activo ? undefined : styles.inactiva}>
                      <td className={styles.persona}>
                        <strong>{cuenta.nombre}</strong>
                        <small>{cuenta.usuario}</small>
                      </td>
                      <td>
                        <select
                          className={styles.selectRol}
                          value={cuenta.role}
                          aria-label={`Rol de ${cuenta.nombre}`}
                          disabled={propia || guardando}
                          onChange={(e) => cambiarRol(cuenta, e.target.value)}
                        >
                          {ROLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </select>
                      </td>
                      <td>{cuenta.instituto ?? <span className={styles.detalle}>Sin instituto</span>}</td>
                      <td>
                        <span className={`${styles.etiqueta} ${cuenta.activo ? styles.ok : styles.no}`}>
                          {cuenta.activo ? 'Activa' : 'Acceso revocado'}
                        </span>
                      </td>
                      <td>
                        {propia ? (
                          <span className={styles.tuCuenta}>Tu cuenta</span>
                        ) : cuenta.activo ? (
                          <button
                            type="button"
                            className={styles.botonPeligro}
                            disabled={guardando}
                            onClick={() => setPorRevocar(cuenta)}
                          >
                            Revocar acceso
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.boton}
                            disabled={guardando}
                            onClick={() => reactivar(cuenta)}
                          >
                            Reactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {porRevocar && (
        <ModalConfirmar
          titulo="Revocar el acceso"
          textoConfirmar="Revocar acceso"
          peligro
          onConfirmar={confirmarRevocacion}
          onCancelar={() => setPorRevocar(null)}
        >
          <p>
            <strong>{porRevocar.nombre}</strong> ({porRevocar.usuario}) no va a poder iniciar sesión y se le cierra
            la sesión que tenga abierta. Podés reactivar el acceso cuando quieras.
          </p>
        </ModalConfirmar>
      )}
    </div>
  );
}

export default Usuarios;
