const express = require('express');
const ceapController = require('../controllers/ceapController');

const router = express.Router();

router.get('/dashboard', ceapController.getDashboardData);
router.post('/', ceapController.createCEAP);
router.get('/plantel/:plantelId', ceapController.getCEAPByPlantel);
router.get('/:ceapId/fases', ceapController.getCEAPFases);
router.put('/fases/:ceapFaseId', ceapController.updateCEAPFase);
router.delete('/:ceapId', ceapController.deleteCEAP);

module.exports = router;
