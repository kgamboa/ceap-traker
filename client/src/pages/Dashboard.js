import React, { useState, useEffect } from 'react';
import { ceapService, planteleService, exportService } from '../services/api';
import { StatCard, PlanteleCard } from '../components/SharedComponents';
import { Download, BarChart3, AlertCircle, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Plugin para marcar con fondo amarillo los planteles sin captura
const highlightZeroPlugin = {
  id: 'highlightZero',
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const yAxis = chart.scales.y;

    chart.data.datasets[0].data.forEach((value, index) => {
      if (value === 0) {
        const y = yAxis.getPixelForTick(index);
        const tickLabel = yAxis._labelItems[index];

        if (tickLabel) {
          // Draw yellow background
          ctx.save();
          ctx.fillStyle = '#fef08a'; // yellow-200
          const padding = 4;
          const textWidth = ctx.measureText(tickLabel.label).width;
          const rectX = tickLabel.translation[0] - textWidth - padding;
          const rectY = y - tickLabel.font.size / 2 - padding;
          const rectWidth = textWidth + padding * 2;
          const rectHeight = tickLabel.font.size + padding * 2;

          ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
          ctx.restore();
        }
      }
    });
  }
};

export const Dashboard = ({ onPlanteleSelect }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [planteles, setPlanteles] = useState([]);
  const [ceapMap, setCeapMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showNewPlantelModal, setShowNewPlantelModal] = useState(false);
  const [savingPlantel, setSavingPlantel] = useState(false);
  const [showChart, setShowChart] = useState(false);
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
      await planteleService.create(newPlantelData);
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
        />
      </div>

      <div className="progress-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Avance Global por Plantel</h2>
          <button
            className="btn btn-secondary"
            onClick={() => setShowChart(!showChart)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showChart ? (
              <>
                <ChevronUp size={18} /> Ocultar Gráfica
              </>
            ) : (
              <>
                <ChevronDown size={18} /> Mostrar Gráfica
              </>
            )}
          </button>
        </div>
        {showChart && planteles.length > 0 && (
          <div className="chart-container">
            <Bar
              data={{
                labels: planteles.map(p => p.nombre),
                datasets: [
                  {
                    label: 'Porcentaje de Avance (%)',
                    data: planteles.map(p => ceapMap[p.id]?.porcentaje_avance || 0),
                    backgroundColor: planteles.map(p => {
                      const avance = ceapMap[p.id]?.porcentaje_avance || 0;
                      if (avance === 100) return '#10b981';
                      if (avance >= 75) return '#3b82f6';
                      if (avance >= 50) return '#f59e0b';
                      if (avance >= 25) return '#ef6444';
                      return '#9ca3af';
                    }),
                    borderRadius: 4,
                    borderSkipped: false,
                  }
                ]
              }}
              plugins={[highlightZeroPlugin]}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return context.parsed.x + '%';
                      }
                    }
                  },
                  datalabels: {
                    anchor: 'end',
                    align: 'right',
                    formatter: function (value) {
                      return value + '%';
                    },
                    color: '#1f2937',
                    font: {
                      weight: 'bold',
                      size: 11
                    },
                    padding: 4
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function (value) {
                        return value + '%';
                      }
                    }
                  }
                }
              }}
              height={Math.max(400, planteles.length * 30)}
            />
          </div>
        )}
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
                  onChange={(e) => setNewPlantelData({ ...newPlantelData, nombre: e.target.value })}
                  placeholder="Ej: CETIS No. 21"
                />
              </div>

              <div className="form-group">
                <label>Código: <span className="required">*</span></label>
                <input
                  type="text"
                  value={newPlantelData.codigo}
                  onChange={(e) => setNewPlantelData({ ...newPlantelData, codigo: e.target.value })}
                  placeholder="Ej: CF021"
                />
              </div>

              <div className="form-group">
                <label>Municipio:</label>
                <input
                  type="text"
                  value={newPlantelData.municipio}
                  onChange={(e) => setNewPlantelData({ ...newPlantelData, municipio: e.target.value })}
                  placeholder="Ej: León"
                />
              </div>

              <div className="form-group">
                <label>Director:</label>
                <input
                  type="text"
                  value={newPlantelData.director_nombre}
                  onChange={(e) => setNewPlantelData({ ...newPlantelData, director_nombre: e.target.value })}
                  placeholder="Nombre del director"
                />
              </div>

              <div className="form-group">
                <label>Email del Director:</label>
                <input
                  type="email"
                  value={newPlantelData.director_email}
                  onChange={(e) => setNewPlantelData({ ...newPlantelData, director_email: e.target.value })}
                  placeholder="director@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="text"
                  value={newPlantelData.telefono}
                  onChange={(e) => setNewPlantelData({ ...newPlantelData, telefono: e.target.value })}
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
