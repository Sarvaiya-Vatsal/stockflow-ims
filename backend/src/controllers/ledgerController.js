const prisma = require("../config/prismaClient");

async function getLedger(req, res) {
  try {
    const { productId, warehouseId, type, limit } = req.query;

    const where = {};
    if (productId) {
      where.productId = productId;
    }
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }
    if (type) {
      where.type = type;
    }

    const limitValue = parseInt(limit);
    const takeLimit = limitValue > 0 ? limitValue : 50;

    const entries = await prisma.ledgerEntry.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: takeLimit,
    });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ error: "Failed to fetch ledger entries" });
  }
}

module.exports = {
  getLedger,
};

