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

  static async generateExcel(ceaps, todosPlanteles) {
    const pool = require('../config/database');

    // Obtener todas las fases
    const fasesResult = await pool.query('SELECT id, nombre, numero_orden FROM fases ORDER BY numero_orden');
    const todasLasFases = fasesResult.rows;

    // Crear mapa de CEAPs por plantel
    const ceapMap = {};
    ceaps.forEach(ceap => {
      if (!ceapMap[ceap.plantel_id]) {
        ceapMap[ceap.plantel_id] = ceap;
      }
    });

    // Obtener fases completadas por CEAP
    const fasesCompletadasMap = {};
    for (const ceap of ceaps) {
      const fasesResult = await pool.query(
        `SELECT cf.completado, f.nombre, f.numero_orden
         FROM ceap_fases cf
         JOIN fases f ON cf.fase_id = f.id
         WHERE cf.ceap_id = $1
         ORDER BY f.numero_orden`,
        [ceap.id]
      );
      fasesCompletadasMap[ceap.id] = fasesResult.rows;
    }

    // Generar datos para todos los planteles
    const data = todosPlanteles.map(plantel => {
      const ceap = ceapMap[plantel.id];
      let fasesFaltantes = 'Sin Captura';

      if (ceap) {
        const fasesDelCeap = fasesCompletadasMap[ceap.id] || [];
        const faltantes = fasesDelCeap
          .filter(fase => !fase.completado)
          .map(fase => fase.nombre);

        fasesFaltantes = faltantes.length > 0 ? faltantes.join(', ') : 'Ninguna';
      }

      return {
        'Plantel': plantel.nombre,
        'Código': plantel.codigo,
        'Ciclo': ceap ? `${ceap.ciclo_inicio}-${ceap.ciclo_fin}` : 'Sin CEAP',
        'Estado': ceap ? ceap.estado : 'sin_iniciar',
        'Avance (%)': ceap ? ceap.porcentaje_avance : 0,
        'Total Fases': ceap ? ceap.total_fases : 7,
        'Fases Completadas': ceap ? (ceap.fases_completadas || 0) : 0,
        'Fases Faltantes': fasesFaltantes
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

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
