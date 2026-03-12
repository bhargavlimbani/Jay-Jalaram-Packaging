const Material = require("../models/Material");

exports.getMaterials = async (req, res) => {

  try {

    const materials = await Material.findAll();

    res.json(materials);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


exports.addMaterial = async (req, res) => {

  try {

    const material = await Material.create(req.body);

    res.json(material);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};