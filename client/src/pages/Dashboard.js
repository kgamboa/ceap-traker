import React, { useState, useEffect, useRef } from 'react';
import { ceapService, planteleService, exportService } from '../services/api';
import { StatCard, PlanteleCard } from '../components/SharedComponents';
import { Download, BarChart3, AlertCircle, Plus, X } from 'lucide-react';
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
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, BarElement, BarController, Title, Tooltip, Legend, ChartDataLabels);

// Gráfica de barras: Avance por Plantel (para móvil)
const AvanceBarChart = ({ planteles, ceapMap, media }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const labels = planteles.map(p => p.codigo || p.nombre);
    const data = planteles.map(p => ceapMap[p.id]?.porcentaje_avance || 0);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');

    // Colores según avance (igual que PlanteleCard)
    const getBarColor = (avance) => {
      if (avance === 100) return '#10b981'; // verde
      if (avance >= 75) return '#3b82f6'; // azul
      if (avance >= 50) return '#f59e0b'; // naranja
      if (avance >= 25) return '#ef6444'; // rojo claro
      return '#9ca3af'; // gris
    };
    const barColors = planteles.map(p => getBarColor(ceapMap[p.id]?.porcentaje_avance ?? 0));

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avance por Plantel',
            data,
            backgroundColor: barColors,
            borderRadius: 6,
            maxBarThickness: 32,
            datalabels: {
              anchor: 'end',
              align: 'end',
              color: '#222',
              font: { weight: 'bold' },
              formatter: (value) => value > 0 ? value : '',
            }
          },
          {
            label: 'Media Global',
            data: Array(labels.length).fill(media),
            type: 'line',
            borderColor: '#f59e0b',
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 2,
            datalabels: {
              display: (ctx) => ctx.dataIndex === 0,
              align: 'start',
              anchor: 'start',
              color: '#f59e0b',
              font: { weight: 'bold' },
              formatter: (value) => value,
            }
          }
        ]
      },
      options: {
        indexAxis: 'y', // HORIZONTAL BARS
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
            clip: true
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
  }, [planteles, ceapMap, media]);

  const chartHeight = Math.max(400, planteles.length * 18);

  return (
    <div style={{ position: 'relative', width: '100%', height: chartHeight + 'px', marginTop: '1rem' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};



// Nueva gráfica: Avance por Plantel con línea de media
const AvanceLineChart = ({ planteles, ceapMap, media }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const labels = planteles.map(p => p.codigo || p.nombre);
    const data = planteles.map(p => ceapMap[p.id]?.porcentaje_avance || 0);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Avance por Plantel',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointRadius: 5,
            fill: true,
            tension: 0.3,
            datalabels: {
              anchor: 'end',
              align: 'end',
              color: '#222',
              font: { weight: 'bold' },
              formatter: (value) => value > 0 ? value : '',
            }
          },
          {
            label: 'Media Global',
            data: Array(labels.length).fill(media),
            borderColor: '#f59e0b',
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
            datalabels: {
              display: (ctx) => ctx.dataIndex === 0,
              align: 'start',
              anchor: 'start',
              color: '#f59e0b',
              font: { weight: 'bold' },
              formatter: (value) => value,
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => context.parsed.y + '%'
            }
          },
          datalabels: {
            clip: true
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
              callback: (value) => value + '%'
            },
            grid: { display: true }
          },
          x: {
            ticks: { autoSkip: false },
            grid: { display: false }
          }
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
  }, [planteles, ceapMap, media]);

  const chartHeight = Math.max(400, planteles.length * 18);

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
  // Eliminado showChart/setShowChart
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

  // Calcular top 5 mejores y peores planteles por avance
  const plantelesConAvance = planteles.map(p => ({
    ...p,
    avance: ceapMap[p.id]?.porcentaje_avance ?? 0
  }));
  const top5 = [...plantelesConAvance].sort((a, b) => b.avance - a.avance).slice(0, 5);
  const bottom5 = [...plantelesConAvance].sort((a, b) => a.avance - b.avance).slice(0, 5);

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

      {/* Top 5 mejores y peores planteles */}
        <div style={{ display: 'flex', gap: '2rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '1rem' }}>Top 5 Mejores</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {top5.map(p => (
                <div key={p.id} className="stat-card stat-card-green" style={{ background: '#f0fdf4', borderRadius: 8, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, boxShadow: 'var(--shadow)' }}>
                  <div style={{ fontWeight: 600 }}>{p.codigo || p.nombre}</div>
                  <div style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>{p.avance}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '1rem' }}>Top 5 Menores</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {bottom5.map(p => (
                <div key={p.id} className="stat-card stat-card-danger" style={{ background: '#fef2f2', borderRadius: 8, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, boxShadow: 'var(--shadow)' }}>
                  <div style={{ fontWeight: 600 }}>{p.codigo || p.nombre}</div>
                  <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 18 }}>{p.avance}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      <div className="progress-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Avance Global por Plantel</h2>
          <button
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} /> Exportar
          </button>
        </div>
        {planteles.length > 0 && (
          (window.innerWidth < 700
            ? <AvanceBarChart planteles={planteles} ceapMap={ceapMap} media={stats.porcentajeGlobal || 0} />
            : <AvanceLineChart planteles={planteles} ceapMap={ceapMap} media={stats.porcentajeGlobal || 0} />)
        )}
      </div>

      <div className="planteles-section">
        <h2>Estatus por Plantel</h2>
        <div className="planteles-grid">
          {planteles.map(plantel => (
            <PlanteleCard
              key={plantel.id}
              plantel={plantel}
              },
              display: true
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
