const prisma = require("../config/prismaClient");

async function getSummary(req, res) {
  try {
    const totalProducts = await prisma.product.count();
    const totalWarehouses = await prisma.warehouse.count();

    const productsWithReorderLevel = await prisma.product.findMany({
      where: {
        reorderLevel: {
          gt: 0,
        },
      },
      include: {
        stocks: true,
      },
    });

    const lowStockProducts = productsWithReorderLevel.filter((product) => {
      return product.stocks.some(
        (stock) => stock.quantity < product.reorderLevel
      );
    });

    const lowStockCount = lowStockProducts.length;

    res.json({
      totalProducts,
      totalWarehouses,
      lowStockCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
}

module.exports = {
  getSummary,
};

