import React, { useState, useEffect, useRef } from 'react';
import { ceapService } from '../services/api';
import { CheckCircle, AlertCircle, Circle } from 'lucide-react';

const TriStateCheckbox = ({ value, onChange, disabled }) => {
  const getIcon = () => {
    switch (value) {
      case 'verificado': return <CheckCircle size={22} color="#10b981" fill="#ecfdf5" />;
      case 'observado': return <AlertCircle size={22} color="#f59e0b" fill="#fffbeb" />;
      default: return <Circle size={22} color="#d1d5db" />;
    }
  };

  const handleClick = () => {
    if (disabled) return;
    let nextValue;
    if (value === 'verificado') nextValue = 'observado';
    else if (value === 'observado') nextValue = 'pendiente';
    else nextValue = 'verificado';
    onChange(nextValue);
  };

  return (
    <div 
      onClick={handleClick}
      title={disabled ? "Primero debe estar capturado" : `Estado: ${value || 'pendiente'}`}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.1s ease'
      }}
      className="tristate-toggle"
    >
      {getIcon()}
    </div>
  );
};

export const DocumentChecklist = ({ faseId, ceapId, isAdmin, onChange }) => {
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

  const handlePlantelToggle = async (docId, currentValue) => {
    if (isAdmin) return;
    const newValue = !currentValue;
    try {
      await ceapService.updateDocumento(faseId, docId, {
        capturado_plantel: newValue,
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  if (loading) return <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cargando documentos...</div>;

  if (documentos.length === 0) return <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>No hay documentos requeridos para esta fase.</div>;

  return (
    <div className="document-checklist" style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
      <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#374151' }}>Documentos Requeridos</h5>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {documentos.map(doc => {
          const isVerified = doc.estado_verificacion === 'verificado';
          const isObserved = doc.estado_verificacion === 'observado';

          return (
            <li key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
              {isAdmin ? (
                /* Lógica de Admin: Dos controles */
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={doc.capturado_plantel} 
                    onChange={(e) => handleAdminToggle(doc.documento_id, { capturado_plantel: e.target.checked })}
                    title="Captura del Plantel"
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <TriStateCheckbox 
                    value={doc.estado_verificacion} 
                    onChange={(val) => handleAdminToggle(doc.documento_id, { estado_verificacion: val })}
                    disabled={!doc.capturado_plantel}
                    title="Estado de Verificación"
                  />
                </div>
              ) : (
                /* Lógica de Plantel */
                <input 
                  type="checkbox" 
                  checked={doc.capturado_plantel} 
                  onChange={() => handlePlantelToggle(doc.documento_id, doc.capturado_plantel)}
                  disabled={isVerified}
                  style={{ cursor: isVerified ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }}
                />
              )}
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  {doc.documento_nombre}
                </span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: '#6b7280' }}>
                  {doc.fecha_captura && (
                    <span>Capturado: {formatDate(doc.fecha_captura)}</span>
                  )}
                  {doc.fecha_verificacion && isVerified && (
                    <span style={{ color: '#10b981' }}>Verificado: {formatDate(doc.fecha_verificacion)}</span>
                  )}
                  {isObserved && (
                    <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <AlertCircle size={10} /> Observado
                    </span>
                  )}
                </div>
              </div>

              {/* Icono de Estatus de Verificación a la derecha para Plantel solamente */}
              {!isAdmin && (
                <div style={{ marginLeft: 'auto', paddingLeft: '8px' }}>
                  {isVerified ? (
                    <CheckCircle size={22} color="#10b981" />
                  ) : isObserved ? (
                    <AlertCircle size={22} color="#f59e0b" />
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentChecklist;
