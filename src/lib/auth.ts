import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? [Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })] : []),
  ],
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        if (trigger === "signIn" || trigger === "signUp") {
          try {
            const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { avatar: true } });
            token.avatar = dbUser?.avatar || null;
          } catch {
            token.avatar = null;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).avatar = token.avatar || null;
      }
      return session;
    },
  },
});
