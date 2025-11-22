const prisma = require("../config/prismaClient");


async function applyStockChange({ productId, warehouseId, quantityChange, type, reference }) {
  const stock = await prisma.inventoryStock.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
  });

  let updatedStock;

  if (!stock) {
    if (quantityChange < 0) {
      throw new Error("Insufficient stock");
    }
    updatedStock = await prisma.inventoryStock.create({
      data: {
        productId,
        warehouseId,
        quantity: quantityChange,
      },
    });
  } else {
    const newQuantity = stock.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error("Insufficient stock");
    }
    updatedStock = await prisma.inventoryStock.update({
      where: {
        id: stock.id,
      },
      data: {
        quantity: newQuantity,
      },
    });
  }

  const ledgerEntry = await prisma.ledgerEntry.create({
    data: {
      productId,
      warehouseId,
      change: quantityChange,
      type,
      reference,
    },
  });

  return { stock: updatedStock, ledgerEntry };
}

module.exports = {
  applyStockChange,
};

