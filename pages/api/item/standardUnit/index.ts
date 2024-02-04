import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

const handleUpdate = async (req, res) => {
  const { id, standardUnit } = req.body;
  const item = await prisma.item.update({
    where: {
      id: id,
    },
    data: {
      standardUnit: standardUnit,
    },
  });
  res.json(item);
};

export default async function handle(req, res) {
  if (req.method == "PUT") {
    handleUpdate(req, res);
  }
}
