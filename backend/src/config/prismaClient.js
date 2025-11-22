const { PrismaClient } = require("@prisma/client");

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
} catch (error) {
  console.error("Failed to initialize Prisma Client:", error);
  throw error;
}

module.exports = prisma;

