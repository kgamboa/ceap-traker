const express = require('express');
const ceapController = require('../controllers/ceapController');

const router = express.Router();

router.get('/dashboard', ceapController.getDashboardData);
router.post('/', ceapController.createCEAP);
router.get('/plantel/:plantelId', ceapController.getCEAPByPlantel);
router.get('/:ceapId/fases', ceapController.getCEAPFases);
router.put('/fases/:ceapFaseId', ceapController.updateCEAPFase);

router.get('/fases/:ceapFaseId/documentos', ceapController.getDocumentos);
router.put('/fases/:ceapFaseId/documentos/:documentoId', ceapController.updateDocumento);
router.get('/fases/:ceapFaseId/observaciones', ceapController.getObservaciones);
router.post('/fases/:ceapFaseId/observaciones', ceapController.addObservacion);
router.delete('/observaciones/:observacionId', ceapController.deleteObservacion);

router.delete('/:ceapId', ceapController.deleteCEAP);

module.exports = router;
