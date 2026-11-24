/*
 * Textos de ayuda de cada pantalla ("¿Cómo se lee esto?"). Los números salen de utils/umbrales.js
 * para que la explicación nunca diga una cosa y el sistema haga otra.
 *
 * Cada pantalla: { intro, bloques: [{ titulo, items: [texto] }] }
 */
import {
  UMBRAL_ALERTA_COMISION, UMBRAL_ATENCION, UMBRAL_RIESGO_ALTO, UMBRAL_SALTO_LIBRES,
} from './umbrales.js';

const NOTA_LIBRES =
  '"Libre" junta a los alumnos que abandonaron y a los que desaprobaron: el reporte del SIU no los separa, '
  + 'así que el sistema tampoco puede hacerlo.';

export const AYUDA = {
  dashboard: {
    intro: 'Muestra cómo terminó la cursada de una carrera en un período, y dónde hay comisiones con problemas.',
    bloques: [
      {
        titulo: 'Cómo leerlo',
        items: [
          'Las tarjetas dan el total de inscriptos y qué porcentaje terminó promocionado, regular o libre.',
          'El gráfico "Rendimiento por comisión" reparte los alumnos de cada comisión: verde promocionó, azul regularizó, ámbar desaprobó y rojo quedó libre.',
          `Las alertas marcan las comisiones donde el ${UMBRAL_ALERTA_COMISION} % o más quedó libre.`,
          'Los filtros de arriba (período, carrera, materia y modalidad) cambian todo lo que ves.',
        ],
      },
      {
        titulo: 'Tené en cuenta',
        items: [
          'Los porcentajes son sobre los inscriptos que entran en el filtro elegido.',
          NOTA_LIBRES,
          'Los datos son los del último Excel cargado para ese período y carrera.',
        ],
      },
    ],
  },

  materias: {
    intro: 'Sirve para encontrar las materias filtro: las que más alumnos pierden en el camino.',
    bloques: [
      {
        titulo: 'Cómo leerlo',
        items: [
          'La tabla arranca ordenada por mayor porcentaje de libres. Tocá un encabezado para ordenar por otra columna.',
          `El indicador marca Riesgo alto desde ${UMBRAL_RIESGO_ALTO} % de libres, Atención desde ${UMBRAL_ATENCION} % y Estable por debajo.`,
          '"Promedio general libres" es el promedio simple de todas las materias: cada una pesa igual, tenga pocos o muchos alumnos.',
          'Con los botones CSV y PDF descargás la tabla tal como la ves, con el mismo orden.',
        ],
      },
      {
        titulo: 'Tené en cuenta',
        items: [
          'Un porcentaje alto con pocos inscriptos pesa menos que uno con muchos: mirá también la cantidad entre paréntesis.',
          NOTA_LIBRES,
        ],
      },
    ],
  },

  predicciones: {
    intro: 'Estima cuántas comisiones conviene abrir el próximo período para recibir a los alumnos que van a volver a cursar.',
    bloques: [
      {
        titulo: 'Cómo usarlo',
        items: [
          'Elegí la materia, la tasa de recursado (qué parte de los libres vuelve a cursar) y el cupo máximo por comisión.',
          'Los tres resultados se recalculan solos cuando movés cualquiera de los datos.',
        ],
      },
      {
        titulo: 'Cómo se calcula',
        items: [
          'Recursantes esperados = alumnos libres de la materia × tasa de recursado.',
          'Comisiones sugeridas = recursantes esperados ÷ cupo por comisión, redondeado hacia arriba.',
          'Comisiones adicionales = comisiones sugeridas − comisiones que la materia tiene hoy (nunca menos de cero).',
        ],
      },
      {
        titulo: 'Tené en cuenta',
        items: [
          'Es una estimación con los datos que elegís, no un pronóstico estadístico: la tasa de recursado no sale de los datos, la define quien usa la pantalla.',
          'Tope de seguridad: la tasa va de 20 % a 100 % y el cupo de 10 a 100 alumnos por comisión. Si se escribe un cupo fuera de ese rango, el cálculo usa el límite más cercano; así un error de tipeo no pide cientos de comisiones.',
        ],
      },
    ],
  },

  evolucion: {
    intro: 'Muestra cómo cambian la promoción y los libres a lo largo de los períodos, y permite comparar dos períodos entre sí.',
    bloques: [
      {
        titulo: 'Cómo leerlo',
        items: [
          'El gráfico muestra la promoción. Tocá la leyenda para sumar o sacar libres, regulares y desaprobados.',
          'Las tarjetas muestran el último período y cuánto cambió contra el anterior, en puntos porcentuales (pp).',
          'Bajo cada período figura cuántos inscriptos hubo.',
          'Con los filtros elegís la materia, el rango de períodos (atajos o "Desde / Hasta") y el cuatrimestre.',
        ],
      },
      {
        titulo: 'Períodos parciales',
        items: [
          'Un punto hueco, sin línea que lo una, indica un Excel con menos de la mitad de las comisiones habituales: sus datos no son comparables.',
        ],
      },
      {
        titulo: 'Comparar dos períodos',
        items: [
          'La tabla de abajo compara cualquier par de períodos, materia por materia.',
          `Marca una alerta cuando una materia llega a ${UMBRAL_RIESGO_ALTO} % de libres o más, o cuando los libres suben ${UMBRAL_SALTO_LIBRES} pp o más.`,
        ],
      },
    ],
  },
};
