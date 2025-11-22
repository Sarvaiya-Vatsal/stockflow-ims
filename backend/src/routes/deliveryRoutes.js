const express = require("express");
const deliveryController = require("../controllers/deliveryController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authRequired, deliveryController.createDelivery);

module.exports = router;

