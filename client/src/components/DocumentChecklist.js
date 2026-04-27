import React, { useState, useEffect } from 'react';
import { ceapService } from '../services/api';
import { CheckCircle, AlertCircle, Circle, MinusCircle, Clock, XCircle } from 'lucide-react';

const AdminToggleButtons = ({ doc, onChange }) => {
  const status = doc.estado_verificacion;
  const isCaptured = doc.capturado_plantel;

  const btnStyle = (active, activeColor) => ({
    padding: '4px 10px',
    fontSize: '10px',
    fontWeight: '600',
    borderRadius: '4px',
    border: '1px solid',
    borderColor: active ? activeColor : '#d1d5db',
    backgroundColor: active ? activeColor : '#fff',
    color: active ? '#fff' : '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', animation: 'fadeInUp 0.3s ease', maxWidth: '300px' }}>
      <button 
        onClick={() => onChange({ capturado_plantel: !isCaptured })}
        style={btnStyle(isCaptured, '#10b981')}
        title="Cambiar estado de captura"
      >
        {isCaptured ? 'CAPTURADO' : 'SIN CAPTURA'}
      </button>
      
      <div style={{ width: '1px', height: '16px', backgroundColor: '#e5e7eb' }} />
      
      <button onClick={() => onChange({ estado_verificacion: 'verificado' })} style={btnStyle(status === 'verificado', '#10b981')}>VERIFICAR</button>
      <button onClick={() => onChange({ estado_verificacion: 'observado' })} style={btnStyle(status === 'observado', '#f59e0b')}>OBSERVAR</button>
      <button onClick={() => onChange({ estado_verificacion: 'no_aplica' })} style={btnStyle(status === 'no_aplica', '#3b82f6')}>N/A</button>
      <button onClick={() => onChange({ estado_verificacion: 'no_entregado' })} style={btnStyle(status === 'no_entregado', '#ef4444')}>NO ENTR.</button>
      <button onClick={() => onChange({ estado_verificacion: 'pendiente' })} style={btnStyle(status === 'pendiente', '#6b7280')}>PEND.</button>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const PlantelToggleButtons = ({ doc, onChange, disabled }) => {
  const status = doc.estado_verificacion;
  const isCaptured = doc.capturado_plantel;

  const btnStyle = (active, activeColor) => ({
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: active ? activeColor : '#d1d5db',
    backgroundColor: active ? activeColor : '#fff',
    color: active ? '#fff' : '#4b5563',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap',
    boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
  });

  const isEntregado = isCaptured && status === 'pendiente';
  const isNoAplica = status === 'no_aplica';
  const isPendiente = !isCaptured && (status === 'pendiente' || status === 'no_entregado');

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', animation: 'fadeInUp 0.3s ease' }}>
      <button
        onClick={() => !disabled && onChange({ capturado_plantel: true, estado_verificacion: 'pendiente' })}
        style={btnStyle(isEntregado || (status === 'observado' && isCaptured), isEntregado ? '#3b82f6' : status === 'observado' ? '#f59e0b' : '#3b82f6')}
      >
        {status === 'observado' ? 'Solventar' : 'Entregar'}
      </button>
      
      <button
        onClick={() => !disabled && onChange({ capturado_plantel: true, estado_verificacion: 'no_aplica' })}
        style={btnStyle(isNoAplica, '#3b82f6')}
      >
        No aplica
      </button>

      <button
        onClick={() => !disabled && onChange({ capturado_plantel: false, estado_verificacion: 'pendiente' })}
        style={btnStyle(isPendiente, '#6b7280')}
      >
        Pendiente
      </button>
    </div>
  );
};

const DocumentChecklist = ({ faseId, ceapId, isAdmin, onChange }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDocId, setHoveredDocId] = useState(null);

  useEffect(() => {
    fetchDocumentos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faseId]);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const res = await ceapService.getDocumentos(faseId);
      setDocumentos(res.data);
    } catch (e) {
      console.error('Error al cargar documentos:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantelUpdate = async (docId, data) => {
    if (isAdmin) return;
    try {
      await ceapService.updateDocumento(faseId, docId, {
        ...data,
        isAdmin: false,
        ceapId: ceapId
      });
      fetchDocumentos();
      if (onChange) onChange();
    } catch (e) {
      console.error('Error actualizando documento', e);
    }
  };

  const handlePlantelClick = (doc) => {
    if (isAdmin || doc.estado_verificacion === 'verificado') return;
    
    const status = doc.estado_verificacion;
    const isCaptured = doc.capturado_plantel;
    
    if (!isCaptured && status === 'pendiente') {
      handlePlantelUpdate(doc.documento_id, { capturado_plantel: true, estado_verificacion: 'pendiente' });
    } else if (isCaptured && status === 'pendiente') {
      handlePlantelUpdate(doc.documento_id, { capturado_plantel: true, estado_verificacion: 'no_aplica' });
    } else {
      handlePlantelUpdate(doc.documento_id, { capturado_plantel: false, estado_verificacion: 'pendiente' });
    }
  };

  const handleAdminToggle = async (docId, datos) => {
    if (!isAdmin) return;
    try {
      await ceapService.updateDocumento(faseId, docId, {
        ...datos,
        isAdmin: true,
        ceapId: ceapId
      });
      fetchDocumentos();
      if (onChange) onChange();
    } catch (e) {
      console.error('Error actualizando documento por admin', e);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const renderCompactIcon = (doc) => {
    const status = doc.estado_verificacion;
    const isCaptured = doc.capturado_plantel;
    
    if (status === 'verificado') return <CheckCircle size={22} color="#10b981" fill="#ecfdf5" />;
    if (status === 'no_aplica') return <MinusCircle size={22} color="#3b82f6" fill="#eff6ff" />;
    if (status === 'observado') return <AlertCircle size={22} color="#f59e0b" fill="#fffbeb" />;
    if (status === 'no_entregado') return <XCircle size={22} color="#ef4444" fill="#fef2f2" />;
    if (isCaptured) return <Clock size={22} color="#3b82f6" fill="#eff6ff" />;
    return <Circle size={22} color="#d1d5db" />;
  };

  const groupDocuments = () => {
    const categories = ['Padres de Familia', 'Trabajadores', 'Alumnos'];
    const types = ['Convocatoria', 'Acta de Asamblea', 'Lista de Asistencia', 'Evidencia Fotográfica'];
    
    if (documentos.length === 0 || ![1, 2].includes(documentos[0]?.fase_numero_orden)) {
       return { type: 'list', data: documentos };
    }

    const docsByRow = {};
    documentos.forEach(doc => {
      let foundType = types.find(t => doc.documento_nombre.toLowerCase().includes(t.toLowerCase())) || 'Otros';
      let foundCat = categories.find(c => doc.documento_nombre.toLowerCase().includes(c.toLowerCase())) || 'General';
      if (!docsByRow[foundType]) docsByRow[foundType] = {};
      docsByRow[foundType][foundCat] = doc;
    });

    const activeCategories = categories.filter(c => documentos.some(d => d.documento_nombre.includes(c)));
    return { type: 'matrix', data: docsByRow, categories: activeCategories };
  };

  if (loading) return <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cargando documentos...</div>;
  if (documentos.length === 0) return <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>No hay documentos requeridos.</div>;

  const grouped = groupDocuments();

  return (
    <div className="document-checklist" style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h5 style={{ fontSize: '0.9rem', margin: 0, color: '#374151', fontWeight: 'bold' }}>Documentos Requeridos</h5>
      </div>

      {grouped.type === 'matrix' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#6b7280' }}>Tipo de Documento</th>
                {grouped.categories.map(cat => (
                  <th key={cat} style={{ padding: '8px', textAlign: 'center', color: '#6b7280' }}>{cat.replace(' de Familia', '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped.data).map(([type, catDocs]) => (
                <tr key={type} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px', fontWeight: '500', color: '#374151' }}>{type}</td>
                  {grouped.categories.map(cat => {
                    const doc = catDocs[cat];
                    if (!doc) return <td key={cat} style={{ padding: '8px', textAlign: 'center', opacity: 0.1 }}>-</td>;
                    return (
                      <td 
                        key={cat} 
                        style={{ padding: '8px', verticalAlign: 'top', position: 'relative' }}
                        onMouseEnter={() => setHoveredDocId(doc.id)}
                        onMouseLeave={() => setHoveredDocId(null)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                           <div 
                             onClick={() => handlePlantelClick(doc)}
                             style={{ cursor: (!isAdmin && doc.estado_verificacion !== 'verificado') ? 'pointer' : 'default' }}
                           >
                             {renderCompactIcon(doc)}
                           </div>
                           {hoveredDocId === doc.id && (
                             <div style={{ position: 'absolute', zIndex: 10, backgroundColor: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginTop: '26px' }}>
                               {isAdmin ? (
                                 <AdminToggleButtons doc={doc} onChange={(data) => handleAdminToggle(doc.documento_id, data)} />
                               ) : (
                                 doc.estado_verificacion !== 'verificado' && <PlantelToggleButtons doc={doc} onChange={(data) => handlePlantelUpdate(doc.documento_id, data)} />
                               )}
                             </div>
                           )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {documentos.map(doc => (
            <li 
              key={doc.id} 
              onMouseEnter={() => setHoveredDocId(doc.id)}
              onMouseLeave={() => setHoveredDocId(null)}
              tabIndex="0"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                padding: '12px', 
                backgroundColor: hoveredDocId === doc.id ? '#f3f4f6' : '#f9fafb', 
                borderRadius: '8px', 
                outline: 'none',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div 
                     onClick={() => handlePlantelClick(doc)}
                     style={{ cursor: (!isAdmin && doc.estado_verificacion !== 'verificado') ? 'pointer' : 'default' }}
                  >
                    {renderCompactIcon(doc)}
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{doc.documento_nombre}</span>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: '#9ca3af' }}>
                    {doc.fecha_captura && <span>Capturado: {formatDate(doc.fecha_captura)}</span>}
                    {doc.estado_verificacion === 'observado' && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>OBSERVADO</span>}
                    {doc.estado_verificacion === 'no_aplica' && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>NO APLICA</span>}
                    {doc.estado_verificacion === 'no_entregado' && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>NO ENTREGADO</span>}
                  </div>
                </div>
              </div>

              {hoveredDocId === doc.id && (
                <div style={{ paddingLeft: '32px', marginTop: '4px' }}>
                  {isAdmin ? (
                    <AdminToggleButtons doc={doc} onChange={(data) => handleAdminToggle(doc.documento_id, data)} />
                  ) : (
                    doc.estado_verificacion !== 'verificado' && (
                      <PlantelToggleButtons 
                        doc={doc} 
                        onChange={(data) => handlePlantelUpdate(doc.documento_id, data)}
                      />
                    )
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentChecklist;
