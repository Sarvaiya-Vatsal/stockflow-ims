const prisma = require("../config/prismaClient");

async function getAllProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      include: {
        stocks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const productsWithStock = products.map((product) => {
      const totalStock = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        reorderLevel: product.reorderLevel,
        totalStock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    res.json(productsWithStock);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

async function createProduct(req, res) {
  try {
    const { name, sku, category, unit, reorderLevel } = req.body;

    if (!name || !sku || !unit) {
      return res.status(400).json({ error: "Name, SKU, and unit are required" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return res.status(400).json({ error: "Product with this SKU already exists" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category: category || null,
        unit,
        reorderLevel: reorderLevel || 0,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, category, unit, reorderLevel } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (unit !== undefined) updateData.unit = unit;
    if (reorderLevel !== undefined) updateData.reorderLevel = reorderLevel;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
};

