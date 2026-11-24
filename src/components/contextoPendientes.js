import { createContext, useContext } from 'react';

/*
 * Cantidad de solicitudes pendientes (registro y recuperación de contraseña), para el contador de la barra
 * lateral. La provee AppShell; la pantalla Accesos llama a `refrescar` después de aprobar o rechazar.
 */
export const ContextoPendientes = createContext({ pendientes: 0, refrescar: () => {} });

export const usePendientes = () => useContext(ContextoPendientes);
