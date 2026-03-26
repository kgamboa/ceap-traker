import React, { useState, useEffect, useRef } from 'react';
import { ceapService } from '../services/api';
import { Send } from 'lucide-react';
import { useRole } from '../hooks/useRole';

export const ObservacionesChat = ({ faseId }) => {
  const { isAdmin, user } = useRole();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const mensajesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObservaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faseId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const fetchObservaciones = async () => {
    try {
      setLoading(true);
      const res = await ceapService.getObservaciones(faseId);
      setMensajes(res.data);
    } catch (e) {
      console.error('Error al cargar observaciones', e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const enviarMensaje = async (e) => {
    e && e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      const nombreUsuario = user?.username || (isAdmin ? 'Admin' : 'Plantel');
      
      await ceapService.addObservacion(faseId, {
        usuario_nombre: nombreUsuario,
        es_admin: isAdmin,
        mensaje: nuevoMensaje.trim()
      });
      
      setNuevoMensaje('');
      fetchObservaciones();
    } catch (e) {
      console.error('Error al enviar mensaje', e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
      <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#374151' }}>Observaciones / Chat</h5>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '8px', 
        height: '250px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Cargando chat...</div>
          ) : mensajes.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: 'auto', marginBottom: 'auto' }}>
              No hay observaciones para esta fase. Empieza a escribir abajo.
            </div>
          ) : (
            mensajes.map((msg) => {
              const isMine = msg.es_admin === isAdmin;
              return (
                <div key={msg.id} style={{ 
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: isMine ? (isAdmin ? '#dbeafe' : '#dcfce3') : '#ffffff',
                  border: '1px solid',
                  borderColor: isMine ? (isAdmin ? '#bfdbfe' : '#bbf7d0') : '#e5e7eb',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '2px', fontWeight: '500' }}>
                    {msg.usuario_nombre}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#111827', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.mensaje}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
                    {formatDate(msg.created_at)}
                  </div>
                </div>
              );
            })
          )}
          <div ref={mensajesEndRef} />
        </div>
        
        <div style={{ 
          padding: '8px', 
          backgroundColor: '#ffffff', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '8px'
        }}>
          <textarea
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una observación... (Enter para enviar)"
            style={{ 
              flex: 1, 
              resize: 'none', 
              borderRadius: '4px', 
              border: '1px solid #d1d5db',
              padding: '6px 8px',
              fontSize: '0.85rem',
              height: '36px',
              fontFamily: 'inherit'
            }}
          />
          <button 
            onClick={enviarMensaje}
            disabled={!nuevoMensaje.trim()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              width: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: nuevoMensaje.trim() ? 'pointer' : 'not-allowed',
              opacity: nuevoMensaje.trim() ? 1 : 0.5
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservacionesChat;
