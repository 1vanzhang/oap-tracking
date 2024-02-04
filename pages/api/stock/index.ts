import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

const handleReportStock = async (req, res) => {
  const { itemId, quantity, unitId, timestamp } = req.body;
  await prisma.itemStock.create({
    data: {
      itemId: itemId,
      quantity: quantity,
      timestamp: timestamp,
      unitId: unitId,
    },
  });
  res.status(200).json({ message: "Checkout successful" });
};
const handleDeleteStock = async (req, res) => {
  const { id } = req.body;
  await prisma.itemStock.delete({
    where: {
      id: id,
    },
  });
  res.status(200).json({ message: "Stock deleted" });
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleReportStock(req, res);
  } else if (req.method == "DELETE") {
    handleDeleteStock(req, res);
  }
}
