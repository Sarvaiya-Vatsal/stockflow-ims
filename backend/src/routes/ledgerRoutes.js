const express = require("express");
const ledgerController = require("../controllers/ledgerController");

const router = express.Router();

router.get("/", ledgerController.getLedger);

module.exports = router;

