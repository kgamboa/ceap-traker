const express = require('express');
const planteleController = require('../controllers/planteleController');

const router = express.Router();

router.get('/', planteleController.getAllPlanteles);
router.get('/:id', planteleController.getPlanteleById);
router.post('/', planteleController.createPlantel);
router.put('/:id', planteleController.updatePlantel);

module.exports = router;
