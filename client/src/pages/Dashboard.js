import React, { useState, useEffect } from 'react';
import { ceapService, planteleService, exportService } from '../services/api';
import { ProgressBar, StatCard, PlanteleCard } from './SharedComponents';
import { Download, BarChart3, AlertCircle } from 'lucide-react';
import '../styles/Dashboard.css';

export const Dashboard = ({ onPlanteleSelect }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [planteles, setPlanteles] = useState([]);
  const [ceapMap, setCeapMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

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

      // Crear mapa de CEaPs más recientes por plantel
      const map = {};
      dashRes.data.ceaps.forEach(ceap => {
        if (!map[ceap.plantel_id]) {
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

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await exportService.exportCSV();
      downloadFile(response.data, 'reporte-ceap.csv', 'text/csv');
    } catch (err) {
      console.error(err);
      alert('Error al exportar CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await exportService.exportExcel();
      downloadFile(response.data, 'reporte-ceap.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (err) {
      console.error(err);
      alert('Error al exportar Excel');
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
          <h1>Dashboard CEaP - Guanajuato</h1>
          <p>Seguimiento de la creación y actualización del Centro de Enseñanza y Aprendizaje Práctico</p>
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <Download size={18} /> CSV
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={exporting}
          >
            <Download size={18} /> Excel
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
    </div>
  );
};

export default Dashboard;
