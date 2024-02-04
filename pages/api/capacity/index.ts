import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

// POST /api/capacity
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req, res) {
  const { numPeople, timestamp, id, preventingEntry } = req.body;
  if (req.method == "POST") {
    const result = await prisma.capacityReport.create({
      data: {
        numPeople: numPeople,
        timestamp: timestamp,
        preventingEntry: preventingEntry,
      },
    });

    res.json(result);
  } else if (req.method == "DELETE") {
    const result = await prisma.capacityReport.delete({
      where: { id },
    });
    res.json(result);
  }
}
