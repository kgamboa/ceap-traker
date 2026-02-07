const CEaPModel = require('../models/CEaPModel');
const CEaPFaseModel = require('../models/CEaPFaseModel');

exports.getCEAPByPlantel = async (req, res) => {
  try {
    const { plantelId } = req.params;
    const ceaps = await CEaPModel.getByPlanteles(plantelId);
    res.json(ceaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener CEaPs' });
  }
};

exports.getCEAPFases = async (req, res) => {
  try {
    const { ceapId } = req.params;
    const fases = await CEaPFaseModel.getByCodeAP(ceapId);
    res.json(fases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener fases del CEAP' });
  }
};

exports.updateCEAPFase = async (req, res) => {
  try {
    const { ceapFaseId } = req.params;
    const { ceapId } = req.body;
    
    const faseActualizada = await CEaPFaseModel.update(ceapFaseId, req.body);
    
    // Actualizar el porcentaje de avance del CEAP
    await CEaPModel.updateProgress(ceapId);
    
    res.json(faseActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar fase' });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const ceaps = await CEaPModel.getAllWithProgress();
    
    // Calcular estadísticas globales
    let totalFases = 0;
    let totalFasesCompletadas = 0;
    
    ceaps.forEach(ceap => {
      totalFases += ceap.total_fases;
      totalFasesCompletadas += ceap.fases_completadas;
    });
    
    const porcentajeGlobal = totalFases > 0 ? Math.round((totalFasesCompletadas / totalFases) * 100) : 0;
    
    res.json({
      ceaps,
      estadisticas: {
        totalPlanteles: ceaps.length,
        totalFases,
        totalFasesCompletadas,
        porcentajeGlobal
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

exports.createCEAP = async (req, res) => {
  try {
    const { plantel_id, ciclo_inicio, ciclo_fin } = req.body;
    
    const ceap = await CEaPModel.create(plantel_id, ciclo_inicio, ciclo_fin);
    
    // Inicializar todas las fases para este CEAP
    await CEaPFaseModel.initializeFasesForCEAP(ceap.id);
    
    res.status(201).json(ceap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear CEAP' });
  }
};
exports.deleteCEAP = async (req, res) => {
  try {
    const { ceapId } = req.params;
    
    const ceap = await CEaPModel.delete(ceapId);
    
    if (!ceap) {
      return res.status(404).json({ error: 'CEAP no encontrado' });
    }
    
    res.json({ message: 'CEAP eliminado correctamente', ceap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar CEAP' });
  }
};