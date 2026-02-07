import React, { useState, useEffect, useCallback } from 'react';
import { ceapService, planteleService, exportService } from '../services/api';
import { FaseStatus, ProgressBar } from '../components/SharedComponents';
import { ChevronLeft, Save, Download, AlertCircle, Edit2, Plus, X, Trash2 } from 'lucide-react';
import '../styles/PlanteleDetail.css';

export const PlanteleDetail = ({ plantel, onBack }) => {
  const [ceaps, setCeaps] = useState([]);
  const [selectedCeap, setSelectedCeap] = useState(null);
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFaseId, setEditingFaseId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editingPlantel, setEditingPlantel] = useState(false);
  const [plantelData, setPlantelData] = useState(plantel);
  const [showNewCeapModal, setShowNewCeapModal] = useState(false);
  const [newCeapData, setNewCeapData] = useState({
    ciclo_inicio: new Date().getFullYear(),
    ciclo_fin: new Date().getFullYear() + 1
  });

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
      // Recargar CEAPs para actualizar avances
      await fetchCeaps();
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCeapCSV = async () => {
    try {
      const response = await exportService.exportCEAPExcel(selectedCeap.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ceap-${plantel.codigo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Error al exportar');
    }
  };

  const handleSavePlantel = async () => {
    try {
      setSaving(true);
      await planteleService.update(plantel.id, plantelData);
      setEditingPlantel(false);
      alert('Información del plantel actualizada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la información del plantel');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCeap = async () => {
    try {
      setSaving(true);
      await ceapService.create({
        plantel_id: plantel.id,
        ciclo_inicio: newCeapData.ciclo_inicio,
        ciclo_fin: newCeapData.ciclo_fin
      });
      
      setShowNewCeapModal(false);
      setNewCeapData({
        ciclo_inicio: new Date().getFullYear(),
        ciclo_fin: new Date().getFullYear() + 1
      });
      
      // Recargar los CEaPs
      await fetchCeaps();
      alert('CEAP creado correctamente. Las fases se han inicializado automáticamente.');
    } catch (err) {
      console.error(err);
      alert('Error al crear el CEAP');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCeap = async () => {
    if (!selectedCeap) return;
    
    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el CEAP ${selectedCeap.ciclo_inicio}-${selectedCeap.ciclo_fin}? Esta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;
    
    try {
      setSaving(true);
      await ceapService.delete(selectedCeap.id);
      await fetchCeaps();
      alert('CEAP eliminado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el CEAP');
    } finally {
      setSaving(false);
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
          <div className="info-card-header">
            <h3>Información del Plantel</h3>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => {
                setEditingPlantel(true);
                setPlantelData(plantel);
              }}
            >
              <Edit2 size={16} /> Editar
            </button>
          </div>
          
          {editingPlantel ? (
            <div className="plantel-editor">
              <div className="form-group">
                <label>Nombre del Plantel:</label>
                <input 
                  type="text"
                  value={plantelData.nombre || ''}
                  onChange={(e) => setPlantelData({...plantelData, nombre: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Director:</label>
                <input 
                  type="text"
                  value={plantelData.director_nombre || ''}
                  onChange={(e) => setPlantelData({...plantelData, director_nombre: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email"
                  value={plantelData.director_email || ''}
                  onChange={(e) => setPlantelData({...plantelData, director_email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono:</label>
                <input 
                  type="text"
                  value={plantelData.telefono || ''}
                  onChange={(e) => setPlantelData({...plantelData, telefono: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Municipio:</label>
                <input 
                  type="text"
                  value={plantelData.municipio || ''}
                  onChange={(e) => setPlantelData({...plantelData, municipio: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Estado:</label>
                <input 
                  type="text"
                  value={plantelData.estado || ''}
                  onChange={(e) => setPlantelData({...plantelData, estado: e.target.value})}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn btn-success"
                  onClick={handleSavePlantel}
                  disabled={saving}
                >
                  <Save size={18} /> Guardar
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setEditingPlantel(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p><strong>Director:</strong> {plantelData.director_nombre}</p>
              <p><strong>Email:</strong> {plantelData.director_email}</p>
              <p><strong>Teléfono:</strong> {plantelData.telefono}</p>
              <p><strong>Estado:</strong> {plantelData.estado}</p>
              <p><strong>Municipio:</strong> {plantelData.municipio}</p>
            </>
          )}
        </div>
      </div>

      {ceaps.length === 0 ? (
        <div className="no-ceap">
          <AlertCircle size={48} />
          <p>No hay CEAP registrado para este plantel</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewCeapModal(true)}
          >
            <Plus size={18} /> Crear Nuevo CEAP
          </button>
        </div>
      ) : (
        <>
          <div className="ceap-selector">
            <div className="ceap-selector-left">
              <label><strong>Seleccionar CEAP:</strong></label>
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
            <div className="ceap-selector-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewCeapModal(true)}
              >
                <Plus size={18} /> Nuevo CEAP
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteCeap}
                disabled={saving}
              >
                <Trash2 size={18} /> Eliminar
              </button>
            </div>
          </div>

          {selectedCeap && (
            <>
              <div className="ceap-progress">
                <h2>Avance del CEAP {selectedCeap.ciclo_inicio}-{selectedCeap.ciclo_fin}</h2>
                <ProgressBar percentage={selectedCeap.porcentaje_avance || 0} size="lg" />
              </div>

              <div className="fases-section">
                <div className="fases-header">
                  <h2>Fases de Implementación</h2>
                  <button className="btn btn-primary" onClick={handleExportCeapCSV}>
                    <Download size={18} /> Exportar
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

      {/* Modal para crear nuevo CEAP */}
      {showNewCeapModal && (
        <div className="modal-overlay" onClick={() => setShowNewCeapModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo CEAP</h2>
              <button 
                className="btn-close"
                onClick={() => setShowNewCeapModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Ciclo Inicio:</label>
                <input 
                  type="number"
                  value={newCeapData.ciclo_inicio}
                  onChange={(e) => setNewCeapData({
                    ...newCeapData, 
                    ciclo_inicio: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>Ciclo Fin:</label>
                <input 
                  type="number"
                  value={newCeapData.ciclo_fin}
                  onChange={(e) => setNewCeapData({
                    ...newCeapData, 
                    ciclo_fin: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <p className="modal-info">
                <strong>Nota:</strong> Se crearán automáticamente todas las fases de implementación para este CEAP.
              </p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-success"
                onClick={handleCreateCeap}
                disabled={saving}
              >
                <Plus size={18} /> Crear CEAP
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewCeapModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );};

export default PlanteleDetail;