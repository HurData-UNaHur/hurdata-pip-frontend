
function KpiCard({ titulo, valor, subtitulo, colorBorde }) {
  return (
    // Estilos de las tarjetas.
    <div
      style={{
        backgroundColor: '#1e293b', 
        border: '1px solid #334155', // Borde gris 
        borderTop: colorBorde ? `4px solid ${colorBorde}` : '1px solid #334155',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Título o etiqueta del KPI (ej: "PROMOCIONADOS") */}
      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
        {titulo}
      </span>

      {/* Valor numérico principal (ej: 158 o "52%") */}
      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#f8fafc' }}>
        {valor}
      </h2>

      {/* Subtítulo informativo secundario (opcional) */}
      {subtitulo && (
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {subtitulo}
        </span>
      )}
    </div>
  );
}


export default KpiCard;