import React, { useState, useEffect } from 'react';
import { ceapService } from '../services/api';
import { CheckCircle, AlertCircle, Circle, MinusCircle, Clock } from 'lucide-react';

const MultiStateToggle = ({ value, onChange, disabled, title }) => {
  const states = ['pendiente', 'verificado', 'no_aplica', 'observado'];
  
  const getIcon = () => {
    switch (value) {
      case 'verificado': return <CheckCircle size={22} color="#10b981" fill="#ecfdf5" />;
      case 'no_aplica': return <MinusCircle size={22} color="#3b82f6" fill="#eff6ff" />;
      case 'observado': return <AlertCircle size={22} color="#f59e0b" fill="#fffbeb" />;
      default: return <Circle size={22} color="#d1d5db" />;
    }
  };

  const handleClick = () => {
    if (disabled) return;
    const idx = states.indexOf(value || 'pendiente');
    const nextValue = states[(idx + 1) % states.length];
    onChange(nextValue);
  };

  return (
    <div 
      onClick={handleClick}
      title={title || (disabled ? "Primero debe estar capturado" : `Estado: ${value || 'pendiente'}. Clic para rotar o 1,2,3,4 para elegir.`)}
      className="multistate-toggle"
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {getIcon()}
    </div>
  );
};

const PlantelToggle = ({ doc, onChange, disabled }) => {
  const getStatus = () => {
    if (doc.estado_verificacion === 'no_aplica') return 'no_aplica';
    if (doc.estado_verificacion === 'verificado') return 'verificado';
    if (doc.estado_verificacion === 'observado') return 'observado';
    if (doc.capturado_plantel) return 'capturado';
    return 'pendiente';
  };

  const status = getStatus();

  const getIcon = () => {
    switch (status) {
      case 'no_aplica': return <MinusCircle size={22} color="#3b82f6" fill="#eff6ff" />;
      case 'verificado': return <CheckCircle size={22} color="#10b981" fill="#ecfdf5" />;
      case 'observado': return <AlertCircle size={22} color="#f59e0b" fill="#fffbeb" />;
      case 'capturado': return <Clock size={22} color="#3b82f6" fill="#eff6ff" />;
      default: return <Circle size={22} color="#d1d5db" />;
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (status === 'pendiente') {
      onChange({ capturado_plantel: true, estado_verificacion: 'pendiente' });
    } else if (status === 'capturado') {
      onChange({ capturado_plantel: true, estado_verificacion: 'no_aplica' });
    } else {
      // If it is 'no_aplica' or 'observado', a click resets it to pendiente/empty
      onChange({ capturado_plantel: false, estado_verificacion: 'pendiente' });
    }
  };

  return (
    <div 
      onClick={handleClick}
      title={`Estado: ${status === 'no_aplica' ? 'No aplica' : status === 'verificado' ? 'Verificado por Admin' : status === 'observado' ? 'Observado por Admin' : status === 'capturado' ? 'Capturado (Pendiente de revisar)' : 'Pendiente'}. Clic para cambiar.`}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {getIcon()}
    </div>
  );
};

const DocumentChecklist = ({ faseId, ceapId, isAdmin, onChange }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleKeyDown = (e, docId) => {
    if (!isAdmin) return;
    const key = e.key.toLowerCase();
    const statusMap = { '1': 'verificado', '2': 'no_aplica', '3': 'observado', '4': 'pendiente' };

    if (statusMap[key]) {
      handleAdminToggle(docId, { estado_verificacion: statusMap[key] });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' });
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

  const renderDocControls = (doc) => {
    if (!doc) return <div style={{ opacity: 0.1 }}>-</div>;
    const isLockedForPlantel = doc.estado_verificacion === 'verificado';
    return (
      <div 
        onKeyDown={(e) => handleKeyDown(e, doc.documento_id)} 
        tabIndex="0" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', outline: 'none' }}
      >
        {isAdmin ? (
          <>
            <input 
              type="checkbox" 
              title={doc.capturado_plantel ? "Marcar como NO capturado" : "Marcar como capturado"}
              checked={doc.capturado_plantel} 
              onChange={(e) => handleAdminToggle(doc.documento_id, { capturado_plantel: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <MultiStateToggle 
              value={doc.estado_verificacion} 
              onChange={(val) => handleAdminToggle(doc.documento_id, { estado_verificacion: val })}
              disabled={!doc.capturado_plantel}
            />
          </>
        ) : (
          <PlantelToggle 
            doc={doc} 
            onChange={(data) => handlePlantelUpdate(doc.documento_id, data)}
            disabled={isLockedForPlantel}
          />
        )}
      </div>
    );
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
                  {grouped.categories.map(cat => (
                    <td key={cat} style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {renderDocControls(catDocs[cat])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documentos.map(doc => (
            <li 
              key={doc.id} 
              onKeyDown={(e) => handleKeyDown(e, doc.documento_id)}
              tabIndex="0"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '6px', outline: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>{renderDocControls(doc)}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{doc.documento_nombre}</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: '#9ca3af' }}>
                  {doc.fecha_captura && <span>Capturado: {formatDate(doc.fecha_captura)}</span>}
                  {doc.estado_verificacion === 'observado' && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>OBSERVADO</span>}
                  {doc.estado_verificacion === 'no_aplica' && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>NO APLICA</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentChecklist;
