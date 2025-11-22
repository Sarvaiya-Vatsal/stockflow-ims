const prisma = require("../config/prismaClient");

async function getLedger(req, res) {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });

    res.json(entries);
  } catch (err) {
    console.error("Error fetching ledger:", err);
    res.status(500).json({ error: "Failed to fetch ledger" });
  }
}

module.exports = { getLedger };

