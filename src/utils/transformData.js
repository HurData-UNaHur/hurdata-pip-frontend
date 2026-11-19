// utils/transformData.js

/*
 * Agrupa los estados del SIU en las 4 categorías que usa toda la app.
 * Es la ÚNICA regla: la usan el dashboard (por comisión) y la evolución (por período).
 *
 *   estados: [{ estado: 'Libre', total_alumnos: 10 }, ...]
 *   → { promo, reg, libre, desap, total }
 *
 * desap agrupa Insuficiente y Sin Condición para que la barra complete el 100 %.
 */
export function sumarEstados(estados = []) {
  const get = (nombre) =>
    estados.find((e) => e.estado?.toLowerCase() === nombre.toLowerCase())?.total_alumnos || 0;

  const promo = get('Promocionó') || get('Promociono');
  const reg = get('Regular');
  const libre = get('Libre');
  const desap = get('Insuficiente') + get('Sin Condición');
  return { promo, reg, libre, desap, total: promo + reg + libre + desap };
}

export function transformarDatosBackend(resumenBackend) {
  if (!resumenBackend || !resumenBackend.actividades) {
    return { dataDashboard: {}, listaMaterias: [], nombreCarrera: '', carrerasDisponibles: [] };
  }

  const dataDashboard = {};
  const listaMaterias = [];

  // Extraer el nombre de la carrera activa y la lista de carreras de este período
  const nombreCarrera = resumenBackend.nombre_carrera || resumenBackend.carrera || '';
  const carrerasDisponibles = resumenBackend.carreras_disponibles || [];

  resumenBackend.actividades.forEach((act) => {
    // Generar un ID único y normalizado para usar como clave
    const keyMateria = act.codigo_materia 
      ? String(act.codigo_materia).trim()
      : act.nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    let totalInscriptos = 0;
    let totalPromo = 0;
    let totalReg = 0;
    let totalLibre = 0;

    const comisionesProcesadas = (act.comisiones || []).map((com) => {
      const { promo, reg, libre, desap, total } = sumarEstados(com.estados);

      totalInscriptos += total;
      totalPromo += promo;
      totalReg += reg;
      totalLibre += libre;

      return {
        nombre: com.nombre_completo || `COMISIÓN ${com.numero_comision}`,
        modalidad: (com.modalidad || 'PRESENCIAL').toUpperCase(),
        total,
        promo,
        reg,
        desap,
        libre,
      };
    });

    // 1. Estructura para Dashboard usando la clave normalizada
    dataDashboard[keyMateria] = comisionesProcesadas;

    // 2. Estructura para Selects y componentes (Materias y Predicciones)
    listaMaterias.push({
      id: keyMateria,
      nombre: act.nombre,
      codigo: act.codigo_materia,
      inscriptos: totalInscriptos,
      promo: totalPromo,
      reg: totalReg,
      libre: totalLibre,
      comisiones: comisionesProcesadas.length,
      libresActuales: totalLibre,
      comisionesActuales: comisionesProcesadas.length,
    });
  });

  // Guardamos la carrera dentro del objeto dataDashboard
  dataDashboard.nombre_carrera = nombreCarrera;

  return { dataDashboard, listaMaterias, nombreCarrera, carrerasDisponibles };
}