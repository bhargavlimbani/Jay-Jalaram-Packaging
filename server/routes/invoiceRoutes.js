const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  invoiceController.generateInvoice
);

module.exports = router;