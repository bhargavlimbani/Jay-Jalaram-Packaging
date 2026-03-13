const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateProfile);
router.get(
  "/customers",
  verifyToken,
  checkRole("admin"),
  authController.getCustomers
);
router.get(
  "/customers/:id",
  verifyToken,
  checkRole("admin"),
  authController.getCustomerDetails
);

module.exports = router;
