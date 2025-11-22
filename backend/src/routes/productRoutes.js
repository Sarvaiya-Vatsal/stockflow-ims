const express = require("express");
const productController = require("../controllers/productController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authRequired, productController.getAllProducts);
router.post("/", authRequired, productController.createProduct);
router.put("/:id", authRequired, productController.updateProduct);

module.exports = router;

