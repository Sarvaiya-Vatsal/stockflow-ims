const prisma = require("../config/prismaClient");
const { applyStockChange } = require("../services/stockService");

async function createReceipt(req, res) {
  try {
    const { reference, supplier, warehouseId, lines } = req.body;

    if (!warehouseId) {
      return res.status(400).json({ error: "warehouseId is required" });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: "lines must be a non-empty array" });
    }

    for (const line of lines) {
      if (!line.productId) {
        return res.status(400).json({ error: "Each line must have a productId" });
      }
      if (!line.quantity || line.quantity <= 0) {
        return res.status(400).json({ error: "Each line must have quantity > 0" });
      }
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(400).json({ error: "Warehouse not found" });
    }

    const receiptReference = reference || `RCPT-${Date.now()}`;

    const receipt = await prisma.receipt.create({
      data: {
        reference: receiptReference,
        supplier: supplier || null,
        warehouseId,
        status: "CONFIRMED",
      },
    });

    for (const line of lines) {
      const product = await prisma.product.findUnique({
        where: { id: line.productId },
      });

      if (!product) {
        await prisma.receipt.delete({ where: { id: receipt.id } });
        return res.status(400).json({ error: `Product ${line.productId} not found` });
      }

      try {
        await applyStockChange({
          productId: line.productId,
          warehouseId,
          quantityChange: line.quantity,
          type: "RECEIPT",
          reference: receipt.reference,
        });
      } catch (error) {
        await prisma.receipt.delete({ where: { id: receipt.id } });
        return res.status(400).json({
          error: error.message === "Insufficient stock"
            ? "Insufficient stock"
            : "Failed to update stock",
        });
      }
    }

    res.status(201).json(receipt);
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({ error: "Failed to create receipt" });
  }
}

module.exports = {
  createReceipt,
};

