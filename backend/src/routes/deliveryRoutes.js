const express = require("express");
const deliveryController = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", deliveryController.createDelivery);

module.exports = router;

