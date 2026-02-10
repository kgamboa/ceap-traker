import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ceapService, planteleService, exportService } from '../services/api';
import { StatCard, PlanteleCard } from '../components/SharedComponents';
import { Download, BarChart3, AlertCircle, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Componente de gráfica separado para manejar el ciclo de vida de Chart.js correctamente
const AvanceChart = ({ planteles, ceapMap }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const buildChartData = useCallback(() => {
    const labels = planteles.map(p => p.nombre);
    const data = planteles.map(p => {
      const avance = ceapMap[p.id]?.porcentaje_avance || 0;
      return avance >= 99.5 ? 100 : avance;
    });
    const bgColors = planteles.map(p => {
      const avance = ceapMap[p.id]?.porcentaje_avance || 0;
      if (avance >= 100) return '#10b981';
      if (avance >= 75) return '#3b82f6';
      if (avance >= 50) return '#f59e0b';
      if (avance >= 25) return '#ef6444';
      return '#9ca3af';
    });
    return { labels, data, bgColors };
  }, [planteles, ceapMap]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { labels, data, bgColors } = buildChartData();

    // Destroy previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Porcentaje de Avance (%)',
          data,
          backgroundColor: bgColors,
          borderRadius: 4,
          barThickness: 'flex',
          maxBarThickness: 40,
        }]
      },
      plugins: [ChartDataLabels, {
        id: 'highlightZero',
        afterDraw: (chart) => {
          const ctx2 = chart.ctx;
          const yAxis = chart.scales.y;
          chart.data.datasets[0].data.forEach((value, index) => {
            if (value === 0) {
              const y = yAxis.getPixelForTick(index);
              const tickLabel = yAxis._labelItems?.[index];
              if (tickLabel) {
                ctx2.save();
                ctx2.fillStyle = '#fef08a';
                const padding = 4;
                const textWidth = ctx2.measureText(tickLabel.label).width;
                const rectX = tickLabel.translation[0] - textWidth - padding;
                const rectY = y - tickLabel.font.size / 2 - padding;
                ctx2.fillRect(rectX, rectY, textWidth + padding * 2, tickLabel.font.size + padding * 2);
                ctx2.restore();
              }
            }
          });
        }
      }],
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => context.parsed.x + '%'
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            clip: false,
            offset: 4,
            formatter: (value) => value + '%',
            color: '#1f2937',
            font: { weight: 'bold', size: 11 }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
              callback: (value) => value + '%'
            },
            grid: { display: true }
          },
          y: {
            ticks: { autoSkip: false },
            grid: { display: false }
          }
        },
        layout: {
          padding: { right: 50, top: 10, bottom: 10 }
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [buildChartData]);

  const chartHeight = Math.max(500, planteles.length * 32);

  return (
    <div style={{ position: 'relative', width: '100%', height: chartHeight + 'px', marginTop: '1rem' }}>
      <canvas ref={canvasRef} />
    </div>
  );
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleExportExcel}
              disabled={exporting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={18} /> Exportar
            </button>
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
        </div>
        {showChart && planteles.length > 0 && (
          <AvanceChart planteles={planteles} ceapMap={ceapMap} />
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
