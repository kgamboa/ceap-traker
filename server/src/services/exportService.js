const XLSX = require('xlsx');

class ExportService {
  static generateCSV(ceaps) {
    let csv = 'Plantel,Código,Ciclo,Estado,% Avance,Total Fases,Fases Completadas\n';
    
    ceaps.forEach(ceap => {
      csv += `"${ceap.plantel_nombre}","${ceap.plantel_codigo}","${ceap.ciclo_inicio}-${ceap.ciclo_fin}","${ceap.estado}",${ceap.porcentaje_avance},${ceap.total_fases},${ceap.fases_completadas || 0}\n`;
    });
    
    return csv;
  }

  static generateDetailedCSV(fases) {
    let csv = 'Fase,Orden,Estado,Fecha Conclusión,Fecha Estimada,Completado,Observaciones\n';
    
    fases.forEach(fase => {
      csv += `"${fase.fase_nombre}",${fase.numero_orden},"${fase.estado}","${fase.fecha_conclusión || ''}","${fase.fecha_estimada || ''}",${fase.completado ? 'Sí' : 'No'},"${(fase.observaciones || '').replace(/"/g, '""')}"\n`;
    });
    
    return csv;
  }

  static generateExcel(ceaps) {
    const worksheet = XLSX.utils.json_to_sheet(
      ceaps.map(ceap => ({
        'Plantel': ceap.plantel_nombre,
        'Código': ceap.plantel_codigo,
        'Ciclo': `${ceap.ciclo_inicio}-${ceap.ciclo_fin}`,
        'Estado': ceap.estado,
        'Avance (%)': ceap.porcentaje_avance,
        'Total Fases': ceap.total_fases,
        'Fases Completadas': ceap.fases_completadas || 0
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CEAP');
    
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }

  static generateDetailedExcel(fases) {
    const worksheet = XLSX.utils.json_to_sheet(
      fases.map(fase => ({
        'Fase': fase.fase_nombre,
        'Orden': fase.numero_orden,
        'Estado': fase.estado,
        'Fecha Conclusión': fase.fecha_conclusión || '',
        'Fecha Estimada': fase.fecha_estimada || '',
        'Completado': fase.completado ? 'Sí' : 'No',
        'Observaciones': fase.observaciones || ''
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fases');
    
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}

module.exports = ExportService;
