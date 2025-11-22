const prisma = require("../config/prismaClient");

async function getSummary(req, res) {
  try {
    const { warehouseId } = req.query;

    const whereClause = warehouseId ? { warehouseId } : {};

    const totalProducts = await prisma.product.count();
    const totalWarehouses = await prisma.warehouse.count();

    const productsWithReorderLevel = await prisma.product.findMany({
      where: {
        reorderLevel: {
          gt: 0,
        },
      },
      include: {
        stocks: {
          where: whereClause,
        },
      },
    });

    const lowStockProducts = productsWithReorderLevel.filter((product) => {
      if (warehouseId) {
        return product.stocks.some(
          (stock) => stock.quantity < product.reorderLevel
        );
      }
      return product.stocks.some(
        (stock) => stock.quantity < product.reorderLevel
      );
    });

    const lowStockCount = lowStockProducts.length;

    const pendingReceipts = await prisma.receipt.count({
      where: {
        ...whereClause,
        status: "DRAFT",
      },
    });

    const pendingDeliveries = await prisma.delivery.count({
      where: {
        ...whereClause,
        status: "DRAFT",
      },
    });

    res.json({
      totalProducts,
      totalWarehouses,
      lowStockCount,
      pendingReceipts,
      pendingDeliveries,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
}

async function getRecentActivity(req, res) {
  try {
    const { warehouseId, limit = 10 } = req.query;

    const whereClause = warehouseId ? { warehouseId } : {};

    const entries = await prisma.ledgerEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        warehouse: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
}

module.exports = {
  getSummary,
  getRecentActivity,
};

