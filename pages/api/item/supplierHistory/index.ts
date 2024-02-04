import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

// POST /api/item/supplierHistory

const handleCreate = async (req, res) => {
  const { itemId, date, pricePerUnit, supplierName, suppliedUnitId } = req.body;

  const item = await prisma.itemSupplier.create({
    data: {
      date: date,
      pricePerUnit: pricePerUnit,
      itemId: itemId,
      supplierName: supplierName,
      suppliedUnitId: suppliedUnitId,
    },
  });
  console.log("Created itemSupplier", item);
  res.json(item);
};

const handleDelete = async (req, res) => {
  const { id } = req.body;
  const item = await prisma.itemSupplier.delete({
    where: { id },
  });
  console.log("Deleted itemSupplier", item);
  res.json(item);
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleCreate(req, res);
  } else if (req.method == "DELETE") {
    handleDelete(req, res);
  }
}
