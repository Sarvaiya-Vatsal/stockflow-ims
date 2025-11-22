const prisma = require("../config/prismaClient");
const { applyStockChange } = require("../services/stockService");

async function createDelivery(req, res) {
  try {
    const { reference, customer, warehouseId, lines } = req.body;

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

    const deliveryReference = reference || `DLV-${Date.now()}`;

    const delivery = await prisma.delivery.create({
      data: {
        reference: deliveryReference,
        customer: customer || null,
        warehouseId,
        status: "CONFIRMED",
      },
    });

    for (const line of lines) {
      try {
        await applyStockChange(
          line.productId,
          warehouseId,
          -line.quantity,
          "DELIVERY",
          delivery.reference
        );
      } catch (error) {
        if (error.message === "Insufficient stock") {
          await prisma.delivery.delete({ where: { id: delivery.id } });
          return res.status(400).json({ error: "Insufficient stock" });
        }
        throw error;
      }
    }

    res.status(201).json(delivery);
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({ error: "Failed to create delivery" });
  }
}

module.exports = {
  createDelivery,
};

