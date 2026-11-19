/*
 * Exportación de tablas a CSV y PDF, sin pasar por el backend.
 * Ambos formatos reciben lo mismo: { columnas: [texto], filas: [[valor]] }.
 */

// Para nombres de archivo: sin tildes, espacios ni símbolos
export const slug = (texto) => String(texto ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();

// Celda de CSV: se entrecomilla si tiene separador, comillas o saltos de línea
const celdaCsv = (v) => {
  const t = v == null ? '' : String(v);
  return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

function descargar(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/*
 * CSV con ";" como separador y BOM UTF-8: así Excel en español abre las columnas
 * separadas y respeta las tildes.
 */
export function exportarCSV({ nombreArchivo, columnas, filas }) {
  const lineas = [columnas, ...filas].map((fila) => fila.map(celdaCsv).join(';'));
  const blob = new Blob([`\uFEFF${lineas.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  descargar(blob, `${nombreArchivo}.csv`);
}

/*
 * PDF con título, subtítulo y tabla. jsPDF se carga recién al exportar
 * para no sumarlo al peso inicial de la app.
 */
export async function exportarPDF({ nombreArchivo, titulo, subtitulo, columnas, filas, horizontal = false }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ orientation: horizontal ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text(titulo, 40, 44);
  if (subtitulo) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(subtitulo, 40, 60);
  }
  autoTable(doc, {
    head: [columnas],
    body: filas.map((f) => f.map((v) => (v == null ? '' : String(v)))),
    startY: subtitulo ? 72 : 60,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [0, 122, 51] },
    didDrawPage: () => {
      const { width, height } = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `HurData · UNaHur · generado el ${new Date().toLocaleDateString('es-AR')}`,
        40, height - 20,
      );
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, width - 40, height - 20, { align: 'right' });
    },
  });
  doc.save(`${nombreArchivo}.pdf`);
}
