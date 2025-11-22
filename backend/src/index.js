require("dotenv/config");
const app = require("./app");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in environment variables");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

console.log("\n===========================================");
console.log("🚀 StockFlow IMS Backend Server");
console.log("===========================================");
console.log(`Port: ${PORT}`);
console.log(`Database: ${process.env.DATABASE_URL ? "✅ Configured" : "❌ Not configured"}`);
console.log(`JWT Secret: ${process.env.JWT_SECRET ? "✅ Set" : "❌ Not set"}`);
console.log(`Email Config: ${process.env.EMAIL_USER && process.env.EMAIL_PASS ? "✅ Configured" : "❌ Not configured (OTP will show in console)"}`);
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log(`Email User: ${process.env.EMAIL_USER}`);
  console.log(`Email Host: ${process.env.EMAIL_HOST || "smtp.gmail.com"}`);
}
console.log("===========================================\n");

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

