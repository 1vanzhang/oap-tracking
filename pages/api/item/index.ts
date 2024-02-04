import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

// POST /api/item

const handleCreate = async (req, res) => {
  const { name, standardUnit, units } = req.body;

  const item = await prisma.item.create({
    data: {
      name: name,
      standardUnit: standardUnit,
      units: {
        createMany: {
          data: units,
        },
      },
    },
  });
  res.json(item);
};

const handleUpdate = async (req, res) => {
  const { id, name } = req.body;
  const item = await prisma.item.update({
    where: {
      id: id,
    },
    data: {
      name: name,
    },
  });
  res.json(item);
};
const handleDelete = async (req, res) => {
  const { id } = req.body;
  await prisma.item.delete({
    where: {
      id: id,
    },
  });
  res.status(200).json({ message: "Item deleted" });
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleCreate(req, res);
  } else if (req.method == "PUT") {
    handleUpdate(req, res);
  } else if (req.method == "DELETE") {
    handleDelete(req, res);
  }
}
