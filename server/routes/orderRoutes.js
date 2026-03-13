const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Customer place order
router.post("/", verifyToken, orderController.placeOrder);

// Customer view own orders
router.get("/my", verifyToken, orderController.getMyOrders);

// Customer cancel own pending order
router.delete("/:id", verifyToken, orderController.cancelMyOrder);

// Customer reply to admin
router.put("/:id/reply", verifyToken, orderController.replyToOrder);

// Admin view all orders  
router.get(
  "/",
  verifyToken,
  checkRole("admin"),
  orderController.getAllOrders
);

// Admin update order status
router.put(
  "/:id/status",
  verifyToken,
  checkRole("admin"),
  orderController.updateOrderStatus
);

module.exports = router;
