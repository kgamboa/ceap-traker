import React from 'react';
import '../styles/Dashboard.css';

export const ProgressBar = ({ percentage, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  return (
    <div className={`progress-bar-container ${sizeClasses[size]}`}>
      <div 
        className="progress-bar-fill" 
        style={{ width: `${percentage}%` }}
      />
      <span className="progress-bar-text">{percentage}%</span>
    </div>
  );
};

export const StatCard = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
};

export const FaseStatus = ({ fase }) => {
  const getStatusColor = (estado) => {
    switch(estado) {
      case 'completado': return '#10b981';
      case 'en_progreso': return '#f59e0b';
      case 'no_iniciado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (estado) => {
    switch(estado) {
      case 'completado': return 'Completado';
      case 'en_progreso': return 'En Progreso';
      case 'no_iniciado': return 'No Iniciado';
      default: return estado;
    }
  };

  return (
    <div className="fase-status">
      <div className="fase-status-header">
        <h4>{fase.fase_nombre}</h4>
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(fase.estado) }}
        >
          {getStatusLabel(fase.estado)}
        </span>
      </div>
      {fase.fecha_conclusión && (
        <p className="fase-date">
          <strong>Conclusión:</strong> {new Date(fase.fecha_conclusión).toLocaleDateString('es-MX')}
        </p>
      )}
      {fase.fecha_estimada && (
        <p className="fase-date">
          <strong>Estimada:</strong> {new Date(fase.fecha_estimada).toLocaleDateString('es-MX')}
        </p>
      )}
      {fase.observaciones && (
        <p className="fase-notes">{fase.observaciones}</p>
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

  return (
    <div className="plantel-card" onClick={onClick}>
      <div className="plantel-card-header">
        <h3>{plantel.nombre}</h3>
        <span className="plantel-code">{plantel.codigo}</span>
      </div>
      <div className="plantel-card-body">
        <p><strong>Ciclo:</strong> {getCEaPCycle()}</p>
        <p><strong>Director:</strong> {plantel.director_nombre}</p>
        {ceap && (
          <div className="plantel-progress">
            <small>Avance: {ceap.porcentaje_avance}%</small>
            <div style={{ backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', marginTop: '4px' }}>
              <div 
                style={{
                  backgroundColor: ceap.porcentaje_avance === 100 ? '#10b981' : '#3b82f6',
                  width: `${ceap.porcentaje_avance}%`,
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
