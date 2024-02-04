import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

// POST /api/event

export default async function handle(req, res) {
  const { name, capacity, dates } = req.body;
  if (req.method == "POST") {
    const result = await prisma.event.create({
      data: {
        name: name,
        capacity: capacity,
        dates: dates,
      },
    });
    res.json(result);
  } else if (req.method == "PUT") {
    const result = await prisma.event.update({
      where: { name },
      data: {
        capacity: capacity,
        dates: dates,
      },
    });
    res.json(result);
  } else if (req.method == "DELETE") {
    const result = await prisma.event.delete({
      where: { name },
    });
    res.json(result);
  }
}
