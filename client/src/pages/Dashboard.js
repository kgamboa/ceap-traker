import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ceapService, planteleService, exportService } from '../services/api';
import { StatCard, PlanteleCard } from '../components/SharedComponents';
import { Download, BarChart3, AlertCircle, Plus, X, Search } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRole } from '../hooks/useRole';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, BarElement, BarController, Title, Tooltip, Legend, ChartDataLabels);

const highlightZeroPlugin = {
  id: 'highlightZero',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e5e7eb';
    ctx.moveTo(x.getPixelForValue(0), top);
    ctx.lineTo(x.getPixelForValue(0), bottom);
    ctx.stroke();
    ctx.restore();
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [dashboardData, setDashboardData] = useState(null);
  const [planteles, setPlanteles] = useState([]);
  const [filteredPlanteles, setFilteredPlanteles] = useState([]);
  const [ceapMap, setCeapMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showNewPlantelModal, setShowNewPlantelModal] = useState(false);
  const [savingPlantel, setSavingPlantel] = useState(false);
  const [filterCodigo, setFilterCodigo] = useState('');
  const [filterAvance, setFilterAvance] = useState('');
  const [showNoRevisados, setShowNoRevisados] = useState(false);
  const [filterFechaRevision, setFilterFechaRevision] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('todo'); // todo, pendiente_revision
  const [newPlantelData, setNewPlantelData] = useState({
    nombre: '',
    codigo: '',
    estado: 'Guanajuato',
    municipio: '',
    director_nombre: '',
    director_email: '',
    telefono: ''
  });

  const filterButtonStyle = (isActive) => ({
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#4b5563',
    padding: '0.4rem 1rem',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = [...planteles];

    // Filtro por código
    if (filterCodigo.trim()) {
      const searchTerm = filterCodigo.toLowerCase();
      filtered = filtered.filter(p =>
        p.codigo.toLowerCase().includes(searchTerm) ||
        p.nombre.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por avance
    if (filterAvance && filterAvance !== 'todo') {
      filtered = filtered.filter(p => {
        const avance = ceapMap[p.id]?.porcentaje_avance || 0;
        if (filterAvance === '<50') return avance < 50;
        if (filterAvance === '>=50') return avance >= 50 && avance < 100;
        if (filterAvance === '100') return avance === 100;
        return true;
      });
    }

    // Filtro por estatus de documentos (admin)
    if (filterStatus === 'pendiente_revision') {
      filtered = filtered.filter(p => {
        const ceap = ceapMap[p.id];
        return ceap && ceap.docs_pendientes_revision > 0;
      });
    }

    // Filtro por fecha de revisión (admin)
    if (showNoRevisados) {
      const [y, m, d] = filterFechaRevision.split('-').map(Number);
      const filterDateStart = new Date(y, m - 1, d);
      
      filtered = filtered.filter(p => {
        const ceap = ceapMap[p.id];
        if (!ceap || !ceap.ultima_actualizacion_admin) return true;
        const lastAdminDate = new Date(ceap.ultima_actualizacion_admin);
        return lastAdminDate < filterDateStart;
      });
    }

    setFilteredPlanteles(filtered);
  }, [filterCodigo, filterAvance, showNoRevisados, filterFechaRevision, filterStatus, planteles, ceapMap]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, plantRes] = await Promise.all([
        ceapService.getDashboard(),
        planteleService.getAll()
      ]);

      setDashboardData(dashRes.data);
      setPlanteles(plantRes.data);

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

  const downloadFile = (blob, filename, type) => {
    const url = window.URL.createObjectURL(new Blob([blob], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
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

  const handleCreatePlantel = async () => {
    if (!newPlantelData.nombre || !newPlantelData.codigo) {
      alert('Por favor completa nombre y código del plantel');
      return;
    }
    try {
      setSavingPlantel(true);
      await planteleService.create(newPlantelData);
      setShowNewPlantelModal(false);
      setNewPlantelData({
        nombre: '', codigo: '', estado: 'Guanajuato', municipio: '',
        director_nombre: '', director_email: '', telefono: ''
      });
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

  const handlePlanteleSelect = (plantel) => {
    navigate(`/${plantel.codigo}`);
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (error) return <div className="error-message"><AlertCircle /> {error}</div>;

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
            <button className="btn btn-success" onClick={() => setShowNewPlantelModal(true)} style={{ marginRight: '0.5rem' }}>
              <Plus size={18} /> Nuevo Plantel
            </button>
          )}
          <button className="btn btn-primary" onClick={handleExportExcel} disabled={exporting}>
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Planteles" value={stats.totalPlanteles || 0} icon={<BarChart3 size={24} />} color="blue" />
        <StatCard 
          title="Planteles Completados" 
          value={`${stats.planteleCompletados || 0}/${stats.totalPlanteles || 0} (${stats.totalPlanteles > 0 ? Math.round((stats.planteleCompletados / stats.totalPlanteles) * 100) : 0}%)`} 
          icon={<BarChart3 size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Avance Global" 
          value={`${stats.porcentajeGlobal || 0}%`} 
          icon={<BarChart3 size={24} />} 
          color="purple" 
          subtitle={`Total Captura: ${stats.avanceCapturaGlobal || 0}% / Total Verif: ${stats.avanceVerificacionGlobal || 0}%`}
        />
      </div>

      <div className="planteles-section" style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Estatus por Plantel</h2>
          
          <div className="filters-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="search-box" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por CCT (código) o nombre"
                  value={filterCodigo}
                  onChange={(e) => setFilterCodigo(e.target.value)}
                  style={{ padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', fontSize: '14px' }}
                />
              </div>

              <div className="date-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <input type="checkbox" id="noRevisados" checked={showNoRevisados} onChange={(e) => setShowNoRevisados(e.target.checked)} style={{ cursor: 'pointer' }} />
                <label htmlFor="noRevisados" style={{ cursor: 'pointer', fontSize: '14px' }}>No revisados desde:</label>
                <input type="date" value={filterFechaRevision} onChange={(e) => setFilterFechaRevision(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '2px 8px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '6px' }}>
                <button onClick={() => setFilterAvance('todo')} style={filterButtonStyle(filterAvance === '' || filterAvance === 'todo')}>Todos</button>
                <button onClick={() => setFilterAvance('<50')} style={filterButtonStyle(filterAvance === '<50')}>{'<'}50%</button>
                <button onClick={() => setFilterAvance('>=50')} style={filterButtonStyle(filterAvance === '>=50')}>{'≥'}50%</button>
                <button onClick={() => setFilterAvance('100')} style={filterButtonStyle(filterAvance === '100')}>Completos</button>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '6px' }}>
                  <button onClick={() => setFilterStatus('todo')} style={filterButtonStyle(filterStatus === 'todo')}>Todos Estatus</button>
                  <button 
                    onClick={() => setFilterStatus('pendiente_revision')} 
                    style={filterButtonStyle(filterStatus === 'pendiente_revision')}
                  >
                    Pendiente Revisión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="planteles-grid">
          {filteredPlanteles.map(plantel => (
            <PlanteleCard key={plantel.id} plantel={plantel} ceap={ceapMap[plantel.id]} onClick={() => handlePlanteleSelect(plantel)} />
          ))}
        </div>
        {filteredPlanteles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No se encontraron planteles</div>
        )}
      </div>

      {showNewPlantelModal && (
        <div className="modal-overlay" onClick={() => setShowNewPlantelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Nuevo Plantel</h2>
              <button className="btn-close" onClick={() => setShowNewPlantelModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre del Plantel: <span className="required">*</span></label>
                <input type="text" value={newPlantelData.nombre} onChange={(e) => setNewPlantelData({ ...newPlantelData, nombre: e.target.value })} placeholder="Ej: CETIS No. 21" />
              </div>
              <div className="form-group">
                <label>Código: <span className="required">*</span></label>
                <input type="text" value={newPlantelData.codigo} onChange={(e) => setNewPlantelData({ ...newPlantelData, codigo: e.target.value })} placeholder="Ej: CF021" />
              </div>
              <div className="form-group">
                <label>Municipio:</label>
                <input type="text" value={newPlantelData.municipio} onChange={(e) => setNewPlantelData({ ...newPlantelData, municipio: e.target.value })} placeholder="Ej: León" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleCreatePlantel} disabled={savingPlantel}><Plus size={18} /> Crear Plantel</button>
              <button className="btn btn-secondary" onClick={() => setShowNewPlantelModal(false)} disabled={savingPlantel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
