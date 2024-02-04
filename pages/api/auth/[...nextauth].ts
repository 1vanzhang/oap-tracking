import { NextApiHandler } from "next";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  callbacks: {
    async signIn(user, account, profile) {
      // Check if the user exists in the authorizedUsers table
      const authorizedUser = await prisma.authorizedUser.findFirst({
        where: { email: user.profile.email },
      });

      if (authorizedUser) {
        return true; // Allow sign in
      } else {
        return false; // Block sign in
      }
    },
  },
};
