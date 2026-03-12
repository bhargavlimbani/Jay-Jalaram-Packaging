const express = require("express");
const router = express.Router();

const materialController = require("../controllers/materialController");

router.get("/", materialController.getMaterials);

router.post("/", materialController.addMaterial);

module.exports = router;