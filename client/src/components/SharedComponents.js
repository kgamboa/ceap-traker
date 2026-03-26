import React from 'react';
import '../styles/Dashboard.css';
import { AlertCircle, CheckCircle, Circle } from 'lucide-react';

export const ProgressBar = ({ percentage, color = '#3b82f6', showText = true }) => {
  return (
    <div className="progress-bar-container" style={{ height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden', flex: 1 }}>
      <div
        className="progress-bar-fill"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color, 
          height: '100%',
          transition: 'width 0.3s ease'
        }}
      />
      {showText && <span style={{ fontSize: '10px', position: 'absolute', right: '4px', top: '-14px', fontWeight: 'bold' }}>{percentage}%</span>}
    </div>
  );
};

export const DualProgressBar = ({ avanceCaptura = 0, avanceVerificacion = 0 }) => {
  return (
    <div className="dual-progress-bar" style={{ display: 'flex', gap: '4px', width: '100%', position: 'relative', marginTop: '16px' }}>
      <div style={{ flex: 75, display: 'flex', flexDirection: 'column' }}>
        <small style={{ fontSize: '9px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px' }}>CAPTURA (75%)</small>
        <ProgressBar percentage={avanceCaptura} color="#3b82f6" />
      </div>
      <div style={{ flex: 25, display: 'flex', flexDirection: 'column' }}>
        <small style={{ fontSize: '9px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px' }}>VERIF (25%)</small>
        <ProgressBar percentage={avanceVerificacion} color="#10b981" />
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

export const FaseStatus = ({ fase, isAdmin = false, onEvidenceToggle = null }) => {
  const getStatusColor = (porcentaje) => {
    if (porcentaje >= 100) return '#10b981';
    if (porcentaje > 0) return '#f59e0b';
    return '#9ca3af';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const isCompleted = fase.porcentaje >= 100;

  return (
    <div className="fase-status">
      <div className="fase-status-header">
        <h4>{fase.fase_nombre}</h4>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(fase.porcentaje) }}
        >
          {isCompleted ? 'Completado' : `${fase.porcentaje || 0}%`}
        </span>
      </div>

      <div className="fase-info-compact">
        {isCompleted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p className="fase-date-compact" style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>
              <strong>Conc:</strong> {formatDate(fase.fecha_conclusión || new Date().toISOString())}
            </p>
            <div style={{ flex: 1 }}>
              <DualProgressBar avanceCaptura={100} avanceVerificacion={100} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             {fase.fecha_estimada && (
                <small style={{ fontSize: '11px', color: '#6b7280', alignSelf: 'flex-end' }}>
                  Est: {formatDate(fase.fecha_estimada)}
                </small>
             )}
             <DualProgressBar 
               avanceCaptura={fase.avance_captura || 0} 
               avanceVerificacion={fase.avance_verificacion || 0} 
             />
          </div>
        )}
      </div>

      {fase.observaciones && (
        <p className="fase-notes-compact">{fase.observaciones}</p>
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
                 <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#374151' }}>Avance Global: {ceap.porcentaje_avance || 0}%</span>
               </div>
               <DualProgressBar 
                 avanceCaptura={ceap.avance_captura || 0} 
                 avanceVerificacion={ceap.avance_verificacion || 0} 
               />
            </div>
            {(ceap.ultima_actualizacion_usuario || ceap.ultima_actualizacion_admin || ceap.ultima_actualizacion_documento) && (
              <div className="plantel-timestamps" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                {ceap.ultima_actualizacion_usuario && (
                  <p><strong>Últ. usuario:</strong> {formatDateTime(ceap.ultima_actualizacion_usuario)}</p>
                )}
                {ceap.ultima_actualizacion_admin && (
                  <p><strong>Últ. admin:</strong> {formatDateTime(ceap.ultima_actualizacion_admin)}</p>
                )}
                {ceap.ultima_actualizacion_documento && (
                  <p><strong>Últ. documento:</strong> {new Date(ceap.ultima_actualizacion_documento).toLocaleDateString('es-MX')}</p>
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
