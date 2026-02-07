import React, { useState, useEffect, useCallback } from 'react';
import { ceapService, exportService } from '../services/api';
import { FaseStatus, ProgressBar } from '../components/SharedComponents';
import { ChevronLeft, Save, Download, AlertCircle } from 'lucide-react';
import '../styles/PlanteleDetail.css';

export const PlanteleDetail = ({ plantel, onBack }) => {
  const [ceaps, setCeaps] = useState([]);
  const [selectedCeap, setSelectedCeap] = useState(null);
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFaseId, setEditingFaseId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchCeaps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ceapService.getByPlantel(plantel.id);
      setCeaps(response.data);
      if (response.data.length > 0) {
        setSelectedCeap(response.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [plantel.id]);

  const fetchFases = useCallback(async (ceapId) => {
    try {
      const response = await ceapService.getFases(ceapId);
      setFases(response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchCeaps();
  }, [fetchCeaps]);

  useEffect(() => {
    if (selectedCeap) {
      fetchFases(selectedCeap.id);
    }
  }, [selectedCeap, fetchFases]);

  const handleEditFase = (faseId, currentData) => {
    setEditingFaseId(faseId);
    setEditData({
      ...currentData,
      ceapId: selectedCeap.id
    });
  };

  const handleSaveFase = async () => {
    try {
      setSaving(true);
      await ceapService.updateFase(editingFaseId, editData);
      setEditingFaseId(null);
      fetchFases(selectedCeap.id);
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCeapCSV = async () => {
    try {
      const response = await exportService.exportCEAPCSV(selectedCeap.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ceap-${plantel.codigo}-detallado.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Error al exportar');
    }
  };

  if (loading) {
    return <div className="loading">Cargando información del plantel...</div>;
  }

  return (
    <div className="plantel-detail">
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={onBack}>
          <ChevronLeft size={20} /> Volver
        </button>
        <div className="detail-title">
          <h1>{plantel.nombre}</h1>
          <p>{plantel.codigo}</p>
        </div>
      </div>

      <div className="detail-info">
        <div className="info-card">
          <h3>Información del Plantel</h3>
          <p><strong>Director:</strong> {plantel.director_nombre}</p>
          <p><strong>Email:</strong> {plantel.director_email}</p>
          <p><strong>Teléfono:</strong> {plantel.telefono}</p>
          <p><strong>Estado:</strong> {plantel.estado}</p>
          <p><strong>Municipio:</strong> {plantel.municipio}</p>
        </div>
      </div>

      {ceaps.length === 0 ? (
        <div className="no-ceap">
          <AlertCircle size={48} />
          <p>No hay CEaP registrado para este plantel</p>
        </div>
      ) : (
        <>
          <div className="ceap-selector">
            <label><strong>Seleccionar CEaP:</strong></label>
            <select 
              value={selectedCeap?.id || ''} 
              onChange={(e) => setSelectedCeap(ceaps.find(c => c.id === e.target.value))}
            >
              {ceaps.map(ceap => (
                <option key={ceap.id} value={ceap.id}>
                  {ceap.ciclo_inicio}-{ceap.ciclo_fin}
                </option>
              ))}
            </select>
          </div>

          {selectedCeap && (
            <>
              <div className="ceap-progress">
                <h2>Avance del CEaP {selectedCeap.ciclo_inicio}-{selectedCeap.ciclo_fin}</h2>
                <ProgressBar percentage={selectedCeap.porcentaje_avance || 0} size="lg" />
              </div>

              <div className="fases-section">
                <div className="fases-header">
                  <h2>Fases de Implementación</h2>
                  <button className="btn btn-primary" onClick={handleExportCeapCSV}>
                    <Download size={18} /> Exportar Detalle
                  </button>
                </div>

                <div className="fases-container">
                  {fases.map(fase => (
                    <div key={fase.id} className="fase-item">
                      {editingFaseId === fase.id ? (
                        <div className="fase-editor">
                          <h4>{fase.fase_nombre}</h4>
                          
                          <div className="form-group">
                            <label>Estado:</label>
                            <select 
                              value={editData.estado || ''}
                              onChange={(e) => setEditData({...editData, estado: e.target.value})}
                            >
                              <option value="no_iniciado">No Iniciado</option>
                              <option value="en_progreso">En Progreso</option>
                              <option value="completado">Completado</option>
                            </select>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Fecha de Conclusión:</label>
                              <input 
                                type="date"
                                value={editData.fecha_conclusión || ''}
                                onChange={(e) => setEditData({...editData, fecha_conclusión: e.target.value})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Fecha Estimada:</label>
                              <input 
                                type="date"
                                value={editData.fecha_estimada || ''}
                                onChange={(e) => setEditData({...editData, fecha_estimada: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Observaciones:</label>
                            <textarea 
                              value={editData.observaciones || ''}
                              onChange={(e) => setEditData({...editData, observaciones: e.target.value})}
                              rows="3"
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              <input 
                                type="checkbox"
                                checked={editData.completado || false}
                                onChange={(e) => setEditData({...editData, completado: e.target.checked})}
                              />
                              Marcar como Completado
                            </label>
                          </div>

                          <div className="form-actions">
                            <button 
                              className="btn btn-success"
                              onClick={handleSaveFase}
                              disabled={saving}
                            >
                              <Save size={18} /> Guardar
                            </button>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => setEditingFaseId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FaseStatus fase={fase} />
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditFase(fase.id, fase)}
                          >
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PlanteleDetail;
