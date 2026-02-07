const PlanteleModel = require('../models/PlanteleModel');

exports.getAllPlanteles = async (req, res) => {
  try {
    const planteles = await PlanteleModel.getAll();
    res.json(planteles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener planteles' });
  }
};

exports.getPlanteleById = async (req, res) => {
  try {
    const { id } = req.params;
    const plantel = await PlanteleModel.getById(id);
    
    if (!plantel) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    
    res.json(plantel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener plantel' });
  }
};

exports.createPlantel = async (req, res) => {
  try {
    const plantel = await PlanteleModel.create(req.body);
    res.status(201).json(plantel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear plantel' });
  }
};

exports.updatePlantel = async (req, res) => {
  try {
    const { id } = req.params;
    const plantel = await PlanteleModel.update(id, req.body);
    
    if (!plantel) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    
    res.json(plantel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar plantel' });
  }
};
