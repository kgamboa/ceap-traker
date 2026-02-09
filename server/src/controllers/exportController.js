const CEaPModel = require('../models/CEaPModel');
const CEaPFaseModel = require('../models/CEaPFaseModel');
const ExportService = require('../services/exportService');

exports.exportDashboardCSV = async (req, res) => {
  try {
    const ceaps = await CEaPModel.getAllWithProgress();

    const csv = ExportService.generateCSV(ceaps);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ceap-' + new Date().getTime() + '.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al exportar CSV' });
  }
};

exports.exportDashboardExcel = async (req, res) => {
  try {
    const PlanteleModel = require('../models/PlanteleModel');
    const todosPlanteles = await PlanteleModel.getAll();
    const ceaps = await CEaPModel.getAllWithProgress();

    const buffer = await ExportService.generateExcel(ceaps, todosPlanteles);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ceap-' + new Date().getTime() + '.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

exports.exportCEAPDetailedCSV = async (req, res) => {
  try {
    const { ceapId } = req.params;
    const fases = await CEaPFaseModel.getByCodeAP(ceapId);

    const csv = ExportService.generateDetailedCSV(fases);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ceap-detallado-' + ceapId + '.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al exportar CSV detallado' });
  }
};
exports.exportCEAPDetailedExcel = async (req, res) => {
  try {
    const { ceapId } = req.params;
    const fases = await CEaPFaseModel.getByCodeAP(ceapId);

    const buffer = ExportService.generateDetailedExcel(fases);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ceap-detallado-' + ceapId + '.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al exportar Excel detallado' });
  }
};