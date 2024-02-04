import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handle(req, res) {
  const { name } = req.body;

  if (req.method == "POST") {
    const result = await prisma.supplier.create({
      data: {
        name: name,
      },
    });
    res.json(result);
  } else if (req.method == "DELETE") {
    const result = await prisma.supplier.delete({
      where: { name },
    });
    res.json(result);
  }
}
