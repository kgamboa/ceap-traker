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

exports.getDocumentos = async (req, res) => {
  try {
    const { ceapFaseId } = req.params;
    const documentos = await CEaPFaseModel.getDocumentos(ceapFaseId);
    res.json(documentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

exports.updateDocumento = async (req, res) => {
  try {
    const { ceapFaseId, documentoId } = req.params;
    const { ceapId } = req.body; // necesitamos ceapId para updateProgress

    const documento = await CEaPFaseModel.updateDocumento(ceapFaseId, documentoId, req.body);

    if (ceapId) {
       await CEaPModel.updateProgress(ceapId);
    }

    res.json(documento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar documento' });
  }
};

exports.getObservaciones = async (req, res) => {
  try {
    const { ceapFaseId } = req.params;
    const observaciones = await CEaPFaseModel.getObservaciones(ceapFaseId);
    res.json(observaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener observaciones' });
  }
};

exports.addObservacion = async (req, res) => {
  try {
    const { ceapFaseId } = req.params;
    const { usuario_nombre, es_admin, mensaje } = req.body;
    
    const observacion = await CEaPFaseModel.addObservacion(ceapFaseId, usuario_nombre, es_admin, mensaje);
    res.status(201).json(observacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar observación' });
  }
};

exports.deleteObservacion = async (req, res) => {
  try {
    const { observacionId } = req.params;
    await CEaPFaseModel.deleteObservacion(observacionId);
    res.json({ message: 'Observación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar observación' });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const ceaps = await CEaPModel.getAllWithProgress();

    // Calcular estadísticas globales considerando TODOS los 25 planteles
    const PlanteleModel = require('../models/PlanteleModel');
    const todosPlanteles = await PlanteleModel.getAll();
    const totalPlanteles = todosPlanteles.length;

    let totalFases = totalPlanteles * 5; // 5 fases por plantel
    let totalFasesCompletadas = 0;
    let planteleCompletados = 0;
    let sumaCaptura = 0;
    let sumaVerificacion = 0;

    ceaps.forEach(ceap => {
      totalFasesCompletadas += (parseInt(ceap.fases_completadas) || 0);
      if (parseInt(ceap.porcentaje_avance) >= 100) {
        planteleCompletados++;
      }
      sumaCaptura += (parseInt(ceap.avance_captura) || 0);
      sumaVerificacion += (parseInt(ceap.avance_verificacion) || 0);
    });

    const porcentajeGlobal = totalFases > 0 ? Math.round((totalFasesCompletadas / totalFases) * 100) : 0;
    const avanceCapturaGlobal = ceaps.length > 0 ? Math.round(sumaCaptura / ceaps.length) : 0;
    const avanceVerificacionGlobal = ceaps.length > 0 ? Math.round(sumaVerificacion / ceaps.length) : 0;

    res.json({
      ceaps,
      estadisticas: {
        totalPlanteles: totalPlanteles,
        planteleCompletados: planteleCompletados,
        totalFases,
        totalFasesCompletadas,
        porcentajeGlobal,
        avanceCapturaGlobal,
        avanceVerificacionGlobal
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

    // Actualizar el porcentaje de avance inicial
    const updatedCeap = await CEaPModel.updateProgress(ceap.id);

    res.status(201).json(updatedCeap);
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

exports.getCEAPSummary = async (req, res) => {
  try {
    const { ceapId } = req.params;
    
    // Obtener datos consolidados del CEAP y avance
    const ceapsWithProgress = await CEaPModel.getAllWithProgress();
    const ceap = ceapsWithProgress.find(c => c.id == ceapId);
    
    if (!ceap) {
      return res.status(404).json({ error: 'CEAP no encontrado' });
    }

    const PlanteleModel = require('../models/PlanteleModel');
    const plantel = await PlanteleModel.getById(ceap.plantel_id);

    const fases = await CEaPFaseModel.getByCodeAP(ceapId);

    const GeminiService = require('../services/geminiService');
    const summary = await GeminiService.generateSummary(plantel, ceap, fases);

    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar resumen ejecutivo' });
  }
};