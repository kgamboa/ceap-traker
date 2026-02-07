const express = require('express');
const router = express.Router();
const planteles = require('./planteles');
const ceaps = require('./ceaps');
const exportController = require('../controllers/exportController');

router.use('/planteles', planteles);
router.use('/ceaps', ceaps);
router.get('/export/csv', exportController.exportDashboardCSV);
router.get('/export/excel', exportController.exportDashboardExcel);
router.get('/export/ceap/:ceapId/csv', exportController.exportCEAPDetailedCSV);

module.exports = router;
