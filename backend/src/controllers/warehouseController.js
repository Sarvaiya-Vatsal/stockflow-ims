const prisma = require("../config/prismaClient");

async function getAllWarehouses(req, res) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
}

async function createWarehouse(req, res) {
  try {
    const { name, code, location } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required" });
    }

    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { code },
    });

    if (existingWarehouse) {
      return res.status(400).json({ error: "Warehouse with this code already exists" });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        location: location || null,
      },
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error("Error creating warehouse:", error);
    res.status(500).json({ error: "Failed to create warehouse" });
  }
}

async function updateWarehouse(req, res) {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    res.json(warehouse);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    res.status(500).json({ error: "Failed to update warehouse" });
  }
}

module.exports = {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
};

