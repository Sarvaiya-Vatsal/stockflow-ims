const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", verificationRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stock/deliveries", deliveryRoutes);
app.use("/api/stock/receipts", receiptRoutes);
app.use("/api/stock/ledger", ledgerRoutes);

module.exports = app;

