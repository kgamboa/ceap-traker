import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ceapService, planteleService, exportService } from '../services/api';
import { StatCard, PlanteleCard } from '../components/SharedComponents';
import { Download, BarChart3, AlertCircle, Plus, X } from 'lucide-react';
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

// Gráfica de barras: Avance por Plantel (para móvil)
// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
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
    fontSize: '14px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s'
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

    // Filtro por fecha de revisión (admin)
    if (showNoRevisados) {
      const filterDate = new Date(filterFechaRevision);
      filtered = filtered.filter(p => {
        const ceap = ceapMap[p.id];
        if (!ceap || !ceap.ultima_actualizacion_admin) return true; // Si no hay revisión, entra en el filtro
        const lastAdminDate = new Date(ceap.ultima_actualizacion_admin);
        return lastAdminDate < filterDate;
      });
    }

    setFilteredPlanteles(filtered);
  }, [filterCodigo, filterAvance, showNoRevisados, filterFechaRevision, planteles, ceapMap]);

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

      const handlePlanteleSelect = (plantel) => {
        navigate(`/${plantel.codigo}`);
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
                  className="btn btn-success"
                  onClick={() => setShowNewPlantelModal(true)}
                  style={{ marginRight: '0.5rem' }}
                >
                  <Plus size={18} /> Nuevo Plantel
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

          <div className="top-5-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="top-5-box">
              <h3 style={{ color: '#10b981', borderBottom: '2px solid #10b981', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Top 5 Mejores Avances</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[...planteles]
                  .sort((a, b) => (ceapMap[b.id]?.porcentaje_avance || 0) - (ceapMap[a.id]?.porcentaje_avance || 0))
                  .slice(0, 5)
                  .map((p, idx) => (
                    <div key={`mejor-${p.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{idx + 1}.</strong> {p.codigo} - {p.nombre}</span>
                      <strong style={{ color: '#10b981', marginLeft: '0.5rem' }}>{ceapMap[p.id]?.porcentaje_avance || 0}%</strong>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="top-5-box">
              <h3 style={{ color: '#ef6444', borderBottom: '2px solid #ef6444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Top 5 Menores Avances</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[...planteles]
                  .sort((a, b) => (ceapMap[a.id]?.porcentaje_avance || 0) - (ceapMap[b.id]?.porcentaje_avance || 0))
                  .slice(0, 5)
                  .map((p, idx) => (
                    <div key={`menor-${p.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{idx + 1}.</strong> {p.codigo} - {p.nombre}</span>
                      <strong style={{ color: '#ef6444', marginLeft: '0.5rem' }}>{ceapMap[p.id]?.porcentaje_avance || 0}%</strong>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="progress-section" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Avance por Tipo (Captura vs Verificación)</h2>
            {planteles.length > 0 && (
              <div className="chart-container" style={{ height: Math.max(400, planteles.length * 35), minHeight: '400px' }}>
                <Bar
                  data={{
                    labels: planteles.map(p => p.codigo || p.nombre),
                    datasets: [
                      {
                        label: 'Avance Captura (75%)',
                        data: planteles.map(p => {
                          const ceap = ceapMap[p.id];
                          if (!ceap) return 0;
                          return ( (ceap.avance_captura || 0) * 0.75 ).toFixed(1);
                        }),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4,
                        barThickness: 24,
                      },
                      {
                        label: 'Avance Verificación (25%)',
                        data: planteles.map(p => {
                          const ceap = ceapMap[p.id];
                          if (!ceap) return 0;
                          return ( (ceap.avance_verificacion || 0) * 0.25 ).toFixed(1);
                        }),
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                        barThickness: 24,
                      }
                    ]
                  }}
                  plugins={[highlightZeroPlugin]}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'top' },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            const val = parseFloat(context.parsed.x).toFixed(1);
                            return `${context.dataset.label}: ${val}%`;
                          },
                          footer: (items) => {
                            const total = items.reduce((a, b) => a + parseFloat(b.parsed.x), 0);
                            return `Avance Total: ${total.toFixed(1)}%`;
                          }
                        }
                      },
                      datalabels: {
                        display: false // Evitamos ruido en gráfica apilada
                      }
                    },
                    scales: {
                      x: {
                        stacked: true,
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: (v) => v + '%' },
                        title: { display: true, text: 'Porcentaje Ponderado (%)' }
                      },
                      y: {
                        stacked: true,
                        ticks: { font: { size: 10, weight: 'bold' } }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="planteles-section" style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Estatus por Plantel</h2>
              
              <div className="filters-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Primera Fila: Buscador y Fecha */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="search-box" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                      <BarChart3 size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por CCT (código) o nombre"
                      value={filterCodigo}
                      onChange={(e) => setFilterCodigo(e.target.value)}
                      style={{
                        padding: '0.6rem 0.6rem 0.6rem 2.5rem',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        width: '100%',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="date-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                    <input 
                      type="checkbox" 
                      id="noRevisados"
                      checked={showNoRevisados}
                      onChange={(e) => setShowNoRevisados(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="noRevisados" style={{ cursor: 'pointer', fontSize: '14px' }}>No revisados desde:</label>
                    <input 
                      type="date" 
                      value={filterFechaRevision}
                      onChange={(e) => setFilterFechaRevision(e.target.value)}
                      style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '2px 8px', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* Segunda Fila: Botones de Avance */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className={`btn-filter ${filterAvance === '' || filterAvance === 'todo' ? 'active' : ''}`}
                    onClick={() => setFilterAvance('todo')}
                    style={filterButtonStyle(filterAvance === '' || filterAvance === 'todo')}
                  >
                    Todos
                  </button>
                  <button 
                    className={`btn-filter ${filterAvance === '<50' ? 'active' : ''}`}
                    onClick={() => setFilterAvance('<50')}
                    style={filterButtonStyle(filterAvance === '<50')}
                  >
                    {'<'}50%
                  </button>
                  <button 
                    className={`btn-filter ${filterAvance === '>=50' ? 'active' : ''}`}
                    onClick={() => setFilterAvance('>=50')}
                    style={filterButtonStyle(filterAvance === '>=50')}
                  >
                    {'≥'}50%
                  </button>
                  <button 
                    className={`btn-filter ${filterAvance === '100' ? 'active' : ''}`}
                    onClick={() => setFilterAvance('100')}
                    style={filterButtonStyle(filterAvance === '100')}
                  >
                    Completos 100%
                  </button>
                </div>
              </div>
            </div>
            <div className="planteles-grid">
              {filteredPlanteles.map(plantel => (
                <PlanteleCard
                  key={plantel.id}
                  plantel={plantel}
                  ceap={ceapMap[plantel.id]}
                  onClick={() => handlePlanteleSelect(plantel)}
                />
              ))}
            </div>
            {filteredPlanteles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No se encontraron planteles que coincidan con los filtros
              </div>
            )}
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
