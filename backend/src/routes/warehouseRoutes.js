const express = require("express");
const warehouseController = require("../controllers/warehouseController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authRequired, warehouseController.getAllWarehouses);
router.post("/", authRequired, warehouseController.createWarehouse);
router.put("/:id", authRequired, warehouseController.updateWarehouse);

module.exports = router;

