import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";

function timingSafePasswordEqual(input: string, expected: string): boolean {
  try {
    const a = Buffer.from(input, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const envPassword = process.env.ADMIN_PASSWORD;

        if (envEmail && envPassword) {
          if (
            email === envEmail &&
            timingSafePasswordEqual(password, envPassword)
          ) {
            return {
              id: envEmail,
              email: envEmail,
              name: process.env.ADMIN_NAME?.trim() || undefined,
            };
          }
          return null;
        }

        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
});
