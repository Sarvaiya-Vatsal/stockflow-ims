const express = require("express");
const ledgerController = require("../controllers/ledgerController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authRequired, ledgerController.getLedger);

module.exports = router;

