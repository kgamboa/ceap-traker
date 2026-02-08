import React, { useState, useEffect } from 'react';
import { ceapService, planteleService, exportService } from '../services/api';
import { ProgressBar, StatCard, PlanteleCard } from '../components/SharedComponents';
import { Download, BarChart3, AlertCircle, Plus, X } from 'lucide-react';
import { useRole } from '../hooks/useRole';
import '../styles/Dashboard.css';

export const Dashboard = ({ onPlanteleSelect }) => {
  const { isAdmin } = useRole();
  const [dashboardData, setDashboardData] = useState(null);
  const [planteles, setPlanteles] = useState([]);
  const [ceapMap, setCeapMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showNewPlantelModal, setShowNewPlantelModal] = useState(false);
  const [savingPlantel, setSavingPlantel] = useState(false);
  const [newPlantelData, setNewPlantelData] = useState({
    nombre: '',
    codigo: '',
    estado: 'Guanajuato',
    municipio: '',
    director_nombre: '',
    director_email: '',
    telefono: ''
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Recargar datos cada 30 segundos para mantenerlos actualizados
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, plantRes] = await Promise.all([
        ceapService.getDashboard(),
        planteleService.getAll()
      ]);

      setDashboardData(dashRes.data);
      setPlanteles(plantRes.data);

      // Crear mapa de CEAPs más recientes por plantel
      const map = {};
      dashRes.data.ceaps.forEach(ceap => {
        if (!map[ceap.plantel_id] || new Date(ceap.created_at) > new Date(map[ceap.plantel_id].created_at)) {
          map[ceap.plantel_id] = ceap;
        }
      });
      setCeapMap(map);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await exportService.exportExcel();
      downloadFile(response.data, 'reporte-ceap.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (err) {
      console.error(err);
      alert('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (blob, filename, type) => {
    const url = window.URL.createObjectURL(new Blob([blob], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleCreatePlantel = async () => {
    if (!newPlantelData.nombre || !newPlantelData.codigo) {
      alert('Por favor completa nombre y código del plantel');
      return;
    }

    try {
      setSavingPlantel(true);
      const response = await planteleService.create(newPlantelData);
      setShowNewPlantelModal(false);
      setNewPlantelData({
        nombre: '',
        codigo: '',
        estado: 'Guanajuato',
        municipio: '',
        director_nombre: '',
        director_email: '',
        telefono: ''
      });
      
      // Recargar planteles
      const plantelesRes = await planteleService.getAll();
      setPlanteles(plantelesRes.data);
      alert('Plantel creado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al crear el plantel');
    } finally {
      setSavingPlantel(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="error-message"><AlertCircle /> {error}</div>;
  }

  const stats = dashboardData?.estadisticas || {};

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard CEAP - Guanajuato</h1>
          <p>Seguimiento del Comité Escolar de Administración Participativa en DGETI</p>
        </div>
        <div className="dashboard-actions">
          {isAdmin && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewPlantelModal(true)}
            >
              <Plus size={18} /> Agregar Plantel
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={exporting}
          >
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Planteles" 
          value={stats.totalPlanteles || 0}
          icon={<BarChart3 size={24} />}
          color="blue"
        />
        <StatCard 
          title="Fases Completadas" 
          value={`${stats.totalFasesCompletadas || 0}/${stats.totalFases || 0}`}
          icon={<BarChart3 size={24} />}
          color="green"
        />
        <StatCard 
          title="Avance Global" 
          value={`${stats.porcentajeGlobal || 0}%`}
          icon={<BarChart3 size={24} />}
          color="purple"
        />
      </div>

      <div className="progress-section">
        <h2>Avance Global</h2>
        <ProgressBar percentage={stats.porcentajeGlobal || 0} size="lg" />
      </div>

      <div className="planteles-section">
        <h2>Estatus por Plantel</h2>
        <div className="planteles-grid">
          {planteles.map(plantel => (
            <PlanteleCard
              key={plantel.id}
              plantel={plantel}
              ceap={ceapMap[plantel.id]}
              onClick={() => onPlanteleSelect(plantel)}
            />
          ))}
        </div>
      </div>

      {/* Modal para crear nuevo Plantel */}
      {showNewPlantelModal && (
        <div className="modal-overlay" onClick={() => setShowNewPlantelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Nuevo Plantel</h2>
              <button 
                className="btn-close"
                onClick={() => setShowNewPlantelModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre del Plantel: <span className="required">*</span></label>
                <input 
                  type="text"
                  value={newPlantelData.nombre}
                  onChange={(e) => setNewPlantelData({...newPlantelData, nombre: e.target.value})}
                  placeholder="Ej: CETIS No. 21"
                />
              </div>

              <div className="form-group">
                <label>Código: <span className="required">*</span></label>
                <input 
                  type="text"
                  value={newPlantelData.codigo}
                  onChange={(e) => setNewPlantelData({...newPlantelData, codigo: e.target.value})}
                  placeholder="Ej: CF021"
                />
              </div>

              <div className="form-group">
                <label>Municipio:</label>
                <input 
                  type="text"
                  value={newPlantelData.municipio}
                  onChange={(e) => setNewPlantelData({...newPlantelData, municipio: e.target.value})}
                  placeholder="Ej: León"
                />
              </div>

              <div className="form-group">
                <label>Director:</label>
                <input 
                  type="text"
                  value={newPlantelData.director_nombre}
                  onChange={(e) => setNewPlantelData({...newPlantelData, director_nombre: e.target.value})}
                  placeholder="Nombre del director"
                />
              </div>

              <div className="form-group">
                <label>Email del Director:</label>
                <input 
                  type="email"
                  value={newPlantelData.director_email}
                  onChange={(e) => setNewPlantelData({...newPlantelData, director_email: e.target.value})}
                  placeholder="director@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Teléfono:</label>
                <input 
                  type="text"
                  value={newPlantelData.telefono}
                  onChange={(e) => setNewPlantelData({...newPlantelData, telefono: e.target.value})}
                  placeholder="Teléfono de contacto"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-success"
                onClick={handleCreatePlantel}
                disabled={savingPlantel}
              >
                <Plus size={18} /> Crear Plantel
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewPlantelModal(false)}
                disabled={savingPlantel}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
