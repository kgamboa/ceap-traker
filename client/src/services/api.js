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
  getByCodigo: (codigo) => api.get(`/planteles/codigo/${codigo}`),
  create: (datos) => api.post('/planteles', datos),
  update: (id, datos) => api.put(`/planteles/${id}`, datos)
};

// Servicios de CEAP
export const ceapService = {
  getDashboard: () => api.get('/ceaps/dashboard'),
  getByPlantel: (plantelId) => api.get(`/ceaps/plantel/${plantelId}`),
  getFases: (ceapId) => api.get(`/ceaps/${ceapId}/fases`),
  create: (datos) => api.post('/ceaps', datos),
  updateFase: (ceapFaseId, datos) => api.put(`/ceaps/fases/${ceapFaseId}`, datos),
  delete: (ceapId) => api.delete(`/ceaps/${ceapId}`),
  getSummary: (ceapId) => api.get(`/ceaps/${ceapId}/summary`),
  
  getDocumentos: (faseId) => api.get(`/ceaps/fases/${faseId}/documentos`),
  updateDocumento: (faseId, docId, datos) => api.put(`/ceaps/fases/${faseId}/documentos/${docId}`, datos),
  getObservaciones: (faseId) => api.get(`/ceaps/fases/${faseId}/observaciones`),
  addObservacion: (faseId, datos) => api.post(`/ceaps/fases/${faseId}/observaciones`, datos),
  deleteObservacion: (id) => api.delete(`/ceaps/observaciones/${id}`)
};

// Servicios de Exportación
export const exportService = {
  exportCSV: () => api.get('/export/csv', { responseType: 'blob' }),
  exportExcel: () => api.get('/export/excel', { responseType: 'blob' }),
  exportCEAPCSV: (ceapId) => api.get(`/export/ceap/${ceapId}/csv`, { responseType: 'blob' }),
  exportCEAPExcel: (ceapId) => api.get(`/export/ceap/${ceapId}/excel`, { responseType: 'blob' })
};

export default api;
