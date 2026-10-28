
export function transformarDatosBackend(resumenBackend) {
  if (!resumenBackend || !resumenBackend.actividades) {
    return { dataDashboard: {}, listaMaterias: [] };
  }

  const dataDashboard = {};
  const listaMaterias = [];

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
      const getEstado = (nombre) => 
        com.estados?.find((e) => e.estado.toLowerCase() === nombre.toLowerCase())?.total_alumnos || 0;

      const promo = getEstado('Promocionó');
      const reg = getEstado('Regular');
      const libre = getEstado('Libre');
      const desap = getEstado('Insuficiente');
      const total = promo + reg + libre + desap + getEstado('Sin Condición');

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

    // 2. Estructura para Selects y componentes
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

  return { dataDashboard, listaMaterias };
}