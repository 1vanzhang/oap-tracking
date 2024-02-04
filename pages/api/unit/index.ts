import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

const handleCreate = async (req, res) => {
  const { ratioToStandard, name, itemId } = req.body;

  const item = await prisma.itemUnit.create({
    data: {
      name: name,
      ratioToStandard: ratioToStandard,
      itemId: itemId,
    },
  });
  res.json(item);
};
const handleDelete = async (req, res) => {
  const { id } = req.body;
  const item = await prisma.itemUnit.delete({
    where: {
      id: id,
    },
  });
  res.json(item);
};
const handleUpdate = async (req, res) => {
  const { id, name, ratioToStandard } = req.body;
  const item = await prisma.itemUnit.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      ratioToStandard: ratioToStandard,
    },
  });
  res.json(item);
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleCreate(req, res);
  } else if (req.method == "DELETE") {
    handleDelete(req, res);
  } else if (req.method == "PUT") {
    handleUpdate(req, res);
  }
}
