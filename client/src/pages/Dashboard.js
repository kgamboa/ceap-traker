import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useRole } from '../hooks/useRole';
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
  const [showChart, setShowChart] = useState(false);
  const [filterCodigo, setFilterCodigo] = useState('');
  const [filterAvance, setFilterAvance] = useState('');
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
    if (filterAvance) {
      const avanceMin = parseInt(filterAvance);
      filtered = filtered.filter(p => {
        const avance = ceapMap[p.id]?.porcentaje_avance || 0;
        if (filterAvance === '0-25') return avance >= 0 && avance <= 25;
        if (filterAvance === '26-50') return avance > 25 && avance <= 50;
        if (filterAvance === '51-75') return avance > 50 && avance <= 75;
        if (filterAvance === '76-100') return avance > 75 && avance <= 100;
        if (filterAvance === '100') return avance === 100;
        return true;
      });
    }

    setFilteredPlanteles(filtered);
  }, [filterCodigo, filterAvance, planteles, ceapMap]);

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
            />
          </div>

          <div className="filters-section">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar por CCT o nombre del plantel..."
                value={filterCodigo}
                onChange={(e) => setFilterCodigo(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <select
                value={filterAvance}
                onChange={(e) => setFilterAvance(e.target.value)}
                style={{ minWidth: 150, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="">Todos los niveles</option>
                <option value="0-25">0-25%</option>
                <option value="26-50">26-50%</option>
                <option value="51-75">51-75%</option>
                <option value="76-100">76-100%</option>
                <option value="100">100% Completado</option>
              </select>
            </div>
          </div>

          <div className="planteles-grid">
            {filteredPlanteles.map(plantel => (
              <PlanteleCard
                key={plantel.id}
                plantel={plantel}
                ceap={ceapMap[plantel.id]}
                onClick={() => navigate(`/${plantel.codigo}`)}
              />
            ))}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Estatus por Plantel</h2>
              <div className="filters-container" style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                <div>
                  <label style={{ marginRight: '0.5rem' }}>Buscar CCT/Plantel:</label>
                  <input
                    type="text"
                    placeholder="Ej: CB139"
                    value={filterCodigo}
                    onChange={(e) => setFilterCodigo(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      width: '150px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ marginRight: '0.5rem' }}>Filtrar por Avance:</label>
                  <select
                    value={filterAvance}
                    onChange={(e) => setFilterAvance(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    <option value="">Todos</option>
                    <option value="0-25">0 - 25%</option>
                    <option value="26-50">26 - 50%</option>
                    <option value="51-75">51 - 75%</option>
                    <option value="76-100">76 - 100%</option>
                    <option value="100">100% Completado</option>
                  </select>
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
  };

export default Dashboard;
