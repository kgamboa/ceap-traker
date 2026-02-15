import React from 'react';
import '../styles/Dashboard.css';
import { AlertCircle, CheckCircle, Circle } from 'lucide-react';

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
    switch (estado) {
      case 'completado': return '#10b981';
      case 'en_progreso': return '#f59e0b';
      case 'no_iniciado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (estado) => {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'en_progreso': return 'En Progreso';
      case 'no_iniciado': return 'No Iniciado';
      default: return estado;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    // Extraer año, mes, día directamente del string para evitar problemas de zona horaria
    const dateOnly = dateString.split('T')[0]; // Obtener solo YYYY-MM-DD
    const [year, month, day] = dateOnly.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: '2-digit' });
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
      <div className="fase-info-compact">
        {fase.fecha_conclusión && (
          <p className="fase-date-compact">
            <strong>Conc:</strong> {formatDate(fase.fecha_conclusión)}
          </p>
        )}
        {/* Mostrar Est solo si no está concluido */}
        {fase.fecha_estimada && !fase.fecha_conclusión && (
          <p className="fase-date-compact">
            <strong>Est:</strong> {formatDate(fase.fecha_estimada)}
          </p>
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

  // Las fases ahora se muestran directamente en la lista dentro de la card (ver más abajo)


  // Ciclo alerta: mostrar si ciclo es 2024-2026 y año actual es 2026
  const showCicloAlerta = ceap && ceap.ciclo_inicio === 2024 && ceap.ciclo_fin === 2026 && new Date().getFullYear() === 2026;

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
          <div className="plantel-progress">
            <small>Avance: {ceap.porcentaje_avance}%</small>
            <div style={{ backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', marginTop: '4px' }}>
              <div
                style={{
                  backgroundColor: (() => {
                    const avance = ceap.porcentaje_avance;
                    if (avance === 100) return '#10b981';
                    if (avance >= 75) return '#3b82f6';
                    if (avance >= 50) return '#f59e0b';
                    if (avance >= 25) return '#ef6444';
                    return '#9ca3af';
                  })(),
                  width: `${ceap.porcentaje_avance}%`,
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
        {/** Mostrar lista completa de fases en la card (check / en progreso / sin iniciar) */}
        {ceap && ceap.fases && ceap.fases.length > 0 && (
          <ul className="plantel-fases-list">
            {ceap.fases.map((f) => {
              const completed = f.completado || f.estado === 'completado';
              const inProgress = f.estado === 'en_progreso';
              return (
                <li key={f.fase_id || f.id || f.fase_nombre} className={`fase-list-item ${completed ? 'completed' : inProgress ? 'in-progress' : 'not-started'}`}>
                  {completed ? (
                    <CheckCircle size={14} color="#10b981" />
                  ) : inProgress ? (
                    <Circle size={14} color="#f59e0b" />
                  ) : (
                    <Circle size={14} color="#9ca3af" />
                  )}
                  <span className="fase-name" style={{ marginLeft: 8, textDecoration: completed ? 'line-through' : 'none', color: completed ? '#6b7280' : '#111827' }}>
                    {f.fase_nombre}
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
