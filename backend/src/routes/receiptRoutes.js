const express = require("express");
const receiptController = require("../controllers/receiptController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authRequired, receiptController.getAllReceipts);
router.post("/", authRequired, receiptController.createReceipt);

module.exports = router;

