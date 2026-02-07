import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Servicios de Planteles
export const planteleService = {
  getAll: () => api.get('/planteles'),
  getById: (id) => api.get(`/planteles/${id}`),
  create: (datos) => api.post('/planteles', datos),
  update: (id, datos) => api.put(`/planteles/${id}`, datos)
};

// Servicios de CEaP
export const ceapService = {
  getDashboard: () => api.get('/ceaps/dashboard'),
  getByPlantel: (plantelId) => api.get(`/ceaps/plantel/${plantelId}`),
  getFases: (ceapId) => api.get(`/ceaps/${ceapId}/fases`),
  create: (datos) => api.post('/ceaps', datos),
  updateFase: (ceapFaseId, datos) => api.put(`/ceaps/fases/${ceapFaseId}`, datos)
};

// Servicios de Exportación
export const exportService = {
  exportCSV: () => api.get('/export/csv', { responseType: 'blob' }),
  exportExcel: () => api.get('/export/excel', { responseType: 'blob' }),
  exportCEAPCSV: (ceapId) => api.get(`/export/ceap/${ceapId}/csv`, { responseType: 'blob' })
};

export default api;
