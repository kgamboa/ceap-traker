import React from 'react';
import { AlertCircle, CheckCircle, Circle, ChevronDown, ChevronUp, Save, Edit2 } from 'lucide-react';
import { ceapService } from '../services/api';

export const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#10b981'; // Green
  if (percentage >= 75) return '#3b82f6';  // Blue
  if (percentage >= 50) return '#eab308';  // Yellow
  if (percentage >= 25) return '#f97316';  // Orange
  return '#ef4444';                       // Red
};

export const ProgressBar = ({ percentage, color, automaticColor = true, showText = true }) => {
  const barColor = automaticColor ? getProgressColor(percentage) : color;
  return (
    <div className="progress-bar-container" style={{ height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden', flex: 1 }}>
      <div
        className="progress-bar-fill"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: barColor, 
          height: '100%',
          transition: 'width 0.3s ease'
        }}
      />
      {showText && <span style={{ fontSize: '10px', position: 'absolute', right: '4px', top: '-14px', fontWeight: 'bold', color: '#374151' }}>{percentage}%</span>}
    </div>
  );
};

export const DualProgressBar = ({ avanceCaptura = 0, avanceVerificacion = 0 }) => {
  return (
    <div className="dual-progress-bar" style={{ display: 'flex', gap: '8px', width: '100%', position: 'relative', marginTop: '16px' }}>
      <div style={{ flex: 75, display: 'flex', flexDirection: 'column' }}>
        <ProgressBar percentage={avanceCaptura} automaticColor={true} />
      </div>
      <div style={{ flex: 25, display: 'flex', flexDirection: 'column' }}>
        <ProgressBar percentage={avanceVerificacion} automaticColor={true} />
      </div>
    </div>
  );
};

export const StatCard = ({ title, value, icon, color = 'blue', subtitle = null }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-value" style={{ marginBottom: subtitle ? '2px' : '0' }}>{value}</p>
        {subtitle && <p style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'bold' }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export const FaseStatus = ({ fase, isAdmin = false, onUpdate = null }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editData, setEditData] = React.useState({
    fecha_estimada: fase.fecha_estimada ? fase.fecha_estimada.split('T')[0] : '',
    observaciones: fase.observaciones || ''
  });

  const getStatusColor = (porcentaje) => getProgressColor(porcentaje);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const isCompleted = fase.porcentaje >= 100;

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await ceapService.updateFase(fase.id, {
        ...editData,
        ceapId: fase.ceap_id,
        isAdmin: isAdmin
      });
      setExpanded(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error al actualizar fase:', err);
      alert('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fase-status" style={{ position: 'relative' }}>
      <div className="fase-status-header" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fase.fase_nombre}
          {!expanded ? <ChevronDown size={14} color="#9ca3af" /> : <ChevronUp size={14} color="#9ca3af" />}
        </h4>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(fase.porcentaje) }}
        >
          {isCompleted ? 'Completado' : `${fase.porcentaje || 0}%`}
        </span>
      </div>

      {!expanded ? (
        <div className="fase-info-compact" onClick={() => setExpanded(true)} style={{ cursor: 'pointer', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            {isCompleted ? (
              <p className="fase-date-compact" style={{ margin: 0, color: '#10b981', fontWeight: 'bold', fontSize: '11px' }}>
                <strong>Conc:</strong> {formatDate(fase.fecha_conclusión || new Date().toISOString())}
              </p>
            ) : fase.fecha_estimada ? (
              <p className="fase-date-compact" style={{ margin: 0, fontSize: '11px' }}>
                <strong>Est:</strong> {formatDate(fase.fecha_estimada)}
              </p>
            ) : null}
            <div style={{ flex: 1 }}>
              <DualProgressBar avanceCaptura={fase.avance_captura || 0} avanceVerificacion={fase.avance_verificacion || 0} />
            </div>
          </div>
          
          {fase.observaciones && (
            <div 
              className="fase-notes-compact" 
              style={{ 
                marginTop: '4px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '2.6em' // Backup for clamp
              }}
            >
              {fase.observaciones}
            </div>
          )}
          {!fase.observaciones && !fase.fecha_estimada && !isCompleted && (
            <small style={{ color: '#9ca3af', fontSize: '10px', fontStyle: 'italic' }}>
              Sin fecha estimada ni notas. Haz clic para agregar.
            </small>
          )}
        </div>
      ) : (
        <div className="fase-editor-inline" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', marginBottom: '2px' }}>Fecha Estimada:</label>
              <input 
                type="date" 
                value={editData.fecha_estimada}
                onChange={(e) => setEditData({...editData, fecha_estimada: e.target.value})}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
               <DualProgressBar avanceCaptura={fase.avance_captura || 0} avanceVerificacion={fase.avance_verificacion || 0} />
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px', marginBottom: '2px' }}>Notas / Observaciones:</label>
            <textarea 
              value={editData.observaciones}
              onChange={(e) => setEditData({...editData, observaciones: e.target.value})}
              placeholder="Escribe detalles sobre el progreso de esta fase..."
              style={{ minHeight: '60px', padding: '8px', fontSize: '12px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              disabled={loading}
              style={{ fontSize: '11px' }}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-sm btn-success" 
              onClick={handleSave}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
            >
              <Save size={14} /> {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlanteleCard = ({ plantel, ceap, onClick }) => {
  const getCEaPCycle = () => {
    if (ceap) {
      return `${ceap.ciclo_inicio}-${ceap.ciclo_fin}`;
    }
    return 'Sin CEAP';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ciclo alerta: mostrar si ciclo es 2024-2026 y año actual es 2026
  const showCicloAlerta = ceap && ceap.ciclo_inicio === 2024 && ceap.ciclo_fin === 2026 && new Date().getFullYear() === 2026;

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  };

  return (
    <div className="plantel-card" onClick={onClick}>
      <div className="plantel-card-header">
        <h3>{plantel.nombre}</h3>
        <span className="plantel-code">{plantel.codigo}</span>
      </div>
      <div className="plantel-card-body">
        <p><strong>Ciclo:</strong> {getCEaPCycle()}</p>
        {showCicloAlerta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', marginBottom: '4px', marginTop: '-4px' }}>
            <AlertCircle size={14} style={{ marginRight: '2px' }} />
            <span>En agosto se debe cambiar de CEAP</span>
          </div>
        )}
        <p><strong>Director:</strong> {plantel.director_nombre}</p>
        {ceap && (
          <>
            <div className="plantel-progress" style={{ marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#374151' }}>
                   Avance Global: <span style={{ color: getProgressColor(ceap.porcentaje_avance || 0) }}>{ceap.porcentaje_avance || 0}%</span>
                 </span>
               </div>
               <DualProgressBar 
                 avanceCaptura={ceap.avance_captura || 0} 
                 avanceVerificacion={ceap.avance_verificacion || 0} 
               />
            </div>
            {(ceap.ultima_actualizacion_usuario || ceap.ultima_actualizacion_admin) && (
              <div className="plantel-timestamps" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                {ceap.ultima_actualizacion_usuario && (
                  <p><strong>Últ. usuario:</strong> {formatDateTime(ceap.ultima_actualizacion_usuario)}</p>
                )}
                {ceap.ultima_actualizacion_admin && (
                  <p><strong>Últ. admin:</strong> {formatDateTime(ceap.ultima_actualizacion_admin)}</p>
                )}
              </div>
            )}
          </>
        )}
        {/** Mostrar lista completa de fases en la card (check / en progreso / sin iniciar) */}
        {ceap && ceap.fases && ceap.fases.length > 0 && (
          <ul className="plantel-fases-list" style={{ marginTop: '0.75rem', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ceap.fases.map((f) => {
              const completed = f.porcentaje >= 100;
              const inProgress = f.porcentaje > 0 && f.porcentaje < 100;
              return (
                <li key={f.fase_id || f.id || f.fase_nombre} className={`fase-list-item ${completed ? 'completed' : inProgress ? 'in-progress' : 'not-started'}`} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                  {completed ? (
                    <CheckCircle size={14} color="#10b981" />
                  ) : inProgress ? (
                    <Circle size={14} color="#f59e0b" />
                  ) : (
                    <Circle size={14} color="#9ca3af" />
                  )}
                  <span className="fase-name" style={{ marginLeft: 8, flex: 1, textDecoration: completed ? 'line-through' : 'none', color: completed ? '#6b7280' : '#111827' }}>
                    {f.fase_nombre}
                  </span>
                  <span className="fase-date" style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '11px' }}>
                    {f.fecha_conclusión ? formatDateShort(f.fecha_conclusión) : f.fecha_estimada ? `est. ${formatDateShort(f.fecha_estimada)}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
