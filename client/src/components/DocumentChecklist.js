import React, { useState, useEffect, useRef } from 'react';
import { ceapService } from '../services/api';
import { CheckCircle, AlertCircle } from 'lucide-react';

const TriStateCheckbox = ({ value, onChange, disabled }) => {
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (checkboxRef.current) {
      if (value === 'observado') {
        checkboxRef.current.indeterminate = true;
        checkboxRef.current.checked = false;
      } else if (value === 'verificado') {
        checkboxRef.current.indeterminate = false;
        checkboxRef.current.checked = true;
      } else {
        checkboxRef.current.indeterminate = false;
        checkboxRef.current.checked = false;
      }
    }
  }, [value]);

  const handleChange = () => {
    let nextValue;
    if (value === 'pendiente') nextValue = 'verificado';
    else if (value === 'verificado') nextValue = 'observado';
    else nextValue = 'pendiente';
    
    onChange(nextValue);
  };

  return (
    <input
      type="checkbox"
      ref={checkboxRef}
      onChange={handleChange}
      disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }}
    />
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

  const handlePlantelToggle = async (docClave, currentValue) => {
    if (isAdmin) return;
    const newValue = !currentValue;
    try {
      await ceapService.updateDocumento(faseId, docClave, {
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

  const handleAdminToggle = async (docClave, nextState) => {
    if (!isAdmin) return;
    try {
      await ceapService.updateDocumento(faseId, docClave, {
        estado_verificacion: nextState,
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
                // Lógica de Admin
                <TriStateCheckbox 
                  value={doc.estado_verificacion} 
                  onChange={(val) => handleAdminToggle(doc.documento_clave, val)}
                  disabled={!doc.capturado_plantel}
                />
              ) : (
                // Lógica de Plantel
                <>
                  {isVerified ? (
                    <CheckCircle size={18} color="#10b981" />
                  ) : (
                    <input 
                      type="checkbox" 
                      checked={doc.capturado_plantel} 
                      onChange={() => handlePlantelToggle(doc.documento_clave, doc.capturado_plantel)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  )}
                </>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentChecklist;
