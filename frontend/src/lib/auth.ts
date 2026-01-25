import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { isDevMode, DEV_EMAIL, DEV_PASSWORD } from "./dev-mode";
import { authApi } from "./api-client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (isDevMode() && credentials.email === DEV_EMAIL && credentials.password === DEV_PASSWORD) {
          const role = credentials.role === "INQUILINO" ? "INQUILINO" : "PROPRIETARIO";
          return {
            id: "dev-1",
            email: DEV_EMAIL,
            name: role === "INQUILINO" ? "Dev (Inquilino)" : "Dev (Proprietário)",
            role,
          };
        }

        try {
          const { user } = await authApi.login({ email: credentials.email, password: credentials.password });
          return { id: user.id, email: user.email, name: user.fullName, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
