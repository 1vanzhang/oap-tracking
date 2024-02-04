// #   itemId: selectedItemId,
// #                   unitId: selectedUnitId,
// #                   quantity,
// #                   timestamp,

import prisma from "../../../lib/prisma";

const handleCheckout = async (req, res) => {
  const { itemId, quantity, unitId, timestamp, userId } = req.body;
  await prisma.itemCheckout.create({
    data: {
      itemId: itemId,
      quantity: quantity,
      timestamp: timestamp,
      unitId: unitId,
      userId: userId,
    },
  });
  res.status(200).json({ message: "Checkout successful" });
};

const handleDeleteCheckout = async (req, res) => {
  const { id } = req.body;
  await prisma.itemCheckout.delete({
    where: {
      id: id,
    },
  });
  res.status(200).json({ message: "Checkout deleted" });
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleCheckout(req, res);
  } else if (req.method == "DELETE") {
    handleDeleteCheckout(req, res);
  }
}
