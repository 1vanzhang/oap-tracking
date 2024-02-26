import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

const handleCreate = async (req, res) => {
  const { order, supplierName, timestamp, actualTotal } = req.body;

  try {
    await prisma.order.create({
      data: {
        supplierName: supplierName,
        timestamp: timestamp,
        actualTotal: actualTotal,
        items: {
          createMany: {
            data: order,
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
  console.log("Order successful");
  res.status(200).json({ message: "Order successful" });
};

const handleDelete = async (req, res) => {
  const { id } = req.body;
  await prisma.order.delete({
    where: {
      id: id,
    },
  });
  res.status(200).json({ message: "Order deleted" });
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleCreate(req, res);
  } else if (req.method == "DELETE") {
    handleDelete(req, res);
  }
}
