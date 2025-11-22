const prisma = require("../config/prismaClient");
const { applyStockChange } = require("../services/stockService");

async function createAdjustment(req, res) {
  try {
    const { reference, warehouseId, productId, newQuantity, reason } = req.body;

    if (!warehouseId || !productId || newQuantity === undefined) {
      return res.status(400).json({
        error: "warehouseId, productId, and newQuantity are required",
      });
    }

    if (typeof newQuantity !== "number" || newQuantity < 0) {
      return res.status(400).json({
        error: "newQuantity must be a non-negative number",
      });
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(400).json({ error: "Warehouse not found" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    let currentStock = await prisma.inventoryStock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (!currentStock) {
      currentStock = await prisma.inventoryStock.create({
        data: {
          productId,
          warehouseId,
          quantity: 0,
        },
      });
    }

    const currentQuantity = currentStock.quantity;
    const adjustmentQuantity = newQuantity - currentQuantity;

    if (adjustmentQuantity === 0) {
      return res.status(400).json({
        error: "New quantity is the same as current quantity",
      });
    }

    const adjustmentReference = reference || `ADJ-${Date.now()}`;

    const adjustment = await prisma.stockAdjustment.create({
      data: {
        reference: adjustmentReference,
        warehouseId,
        reason: reason || null,
      },
    });

    try {
      await applyStockChange({
        productId,
        warehouseId,
        quantityChange: adjustmentQuantity,
        type: "ADJUSTMENT",
        reference: adjustmentReference,
      });
    } catch (error) {
      await prisma.stockAdjustment.delete({ where: { id: adjustment.id } });
      return res.status(400).json({
        error: error.message || "Failed to apply adjustment",
      });
    }

    res.status(201).json(adjustment);
  } catch (error) {
    console.error("Error creating adjustment:", error);
    res.status(500).json({ error: "Failed to create adjustment" });
  }
}

async function getAllAdjustments(req, res) {
  try {
    const { warehouseId } = req.query;

    const whereClause = warehouseId ? { warehouseId } : {};

    const adjustments = await prisma.stockAdjustment.findMany({
      where: whereClause,
      include: {
        warehouse: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(adjustments);
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    res.status(500).json({ error: "Failed to fetch adjustments" });
  }
}

module.exports = {
  createAdjustment,
  getAllAdjustments,
};

