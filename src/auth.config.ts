import type { NextAuthConfig } from "next-auth";

/**
 * Dùng cho Edge (middleware): không import bcrypt/prisma — NextAuth khuyến nghị tách file.
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
