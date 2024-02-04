import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handle(req, res) {
  const { name, email } = req.body;

  if (req.method == "POST") {
    const result = await prisma.authorizedUser.create({
      data: {
        name: name,
        email: email,
      },
    });
    res.json(result);
  } else if (req.method == "DELETE") {
    const result = await prisma.authorizedUser.delete({
      where: { email },
    });
    res.json(result);
  }
}
