import React from 'react';
import { useNavigate } from 'react-router-dom';

const DOCUMENTOS_COLUMNS = [
  { id: 'convocatoria_padres', label: 'Conv. Padres' },
  { id: 'convocatoria_trabajadores', label: 'Conv. Trab.' },
  { id: 'convocatoria_alumnos', label: 'Conv. Alumnos' },
  { id: 'acta_padres', label: 'Acta Padres' },
  { id: 'lista_padres', label: 'Lista Padres' },
  { id: 'evidencia_padres', label: 'Evid. Padres' },
  { id: 'acta_trabajadores', label: 'Acta Trab.' },
  { id: 'lista_trabajadores', label: 'Lista Trab.' },
  { id: 'evidencia_trabajadores', label: 'Evid. Trab.' },
  { id: 'acta_alumnos', label: 'Acta Alum.' },
  { id: 'lista_alumnos', label: 'Lista Alum.' },
  { id: 'evidencia_alumnos', label: 'Evid. Alum.' },
  { id: 'acta_constitutiva', label: 'Acta Const.' },
  { id: 'registro_publico', label: 'Reg. Público' },
  { id: 'acuse_socios', label: 'Acuse Socios' },
  { id: 'e_firma', label: 'e.firma' },
  { id: 'opinion_cumplimiento', label: 'Opinión Cump.' },
  { id: 'contrato_cuenta', label: 'Contrato Cta.' },
  { id: 'registro_firmas', label: 'Reg. Firmas' },
];

const DashboardTable = ({ planteles, ceapMap }) => {
  const navigate = useNavigate();

  const handleRowClick = (plantel) => {
    navigate(`/${plantel.codigo}`);
  };

  const getDocumentStatus = (ceap, docId) => {
    if (!ceap || !ceap.fases) return 'NO';
    for (const fase of ceap.fases) {
      if (fase.documentos) {
        const doc = fase.documentos.find(d => d.clave === docId);
        if (doc && doc.capturado) {
          return 'Entregado';
        }
      }
    }
    return 'NO';
  };

  return (
    <div className="table-responsive" style={{ overflowX: 'auto', marginTop: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '12px' }}>
        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
          <tr>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#374151', position: 'sticky', left: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>Plantel</th>
            {DOCUMENTOS_COLUMNS.map(col => (
              <th key={col.id} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#4b5563', minWidth: '80px', borderLeft: '1px solid #e5e7eb' }}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '120px', display: 'flex', alignItems: 'center' }}>
                  {col.label}
                </div>
              </th>
            ))}
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#374151', borderLeft: '2px solid #e5e7eb', minWidth: '80px' }}>% Avance</th>
          </tr>
        </thead>
        <tbody>
          {planteles.map((plantel, index) => {
            const ceap = ceapMap[plantel.id];
            const isEven = index % 2 === 0;
            return (
              <tr 
                key={plantel.id} 
                onClick={() => handleRowClick(plantel)}
                style={{ 
                  backgroundColor: isEven ? '#ffffff' : '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isEven ? '#ffffff' : '#f9fafb'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#111827', position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 5, borderRight: '1px solid #e5e7eb' }}>
                  {plantel.nombre} <span style={{ color: '#6b7280', fontWeight: 'normal', fontSize: '11px' }}>({plantel.codigo})</span>
                </td>
                
                {DOCUMENTOS_COLUMNS.map(col => {
                  const status = getDocumentStatus(ceap, col.id);
                  const isEntregado = status === 'Entregado';
                  return (
                    <td key={col.id} style={{ padding: '8px', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '9999px', 
                        fontSize: '10px',
                        fontWeight: 'bold',
                        backgroundColor: isEntregado ? '#dcfce7' : '#fee2e2',
                        color: isEntregado ? '#166534' : '#991b1b'
                      }}>
                        {status}
                      </span>
                    </td>
                  );
                })}
                
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderLeft: '2px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ color: ceap?.porcentaje_avance >= 100 ? '#166534' : (ceap?.porcentaje_avance > 0 ? '#b45309' : '#991b1b') }}>
                      {ceap ? `${ceap.porcentaje_avance}%` : '0%'}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;
