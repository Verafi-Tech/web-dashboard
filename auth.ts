import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        let res: Response;
        try {
          res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });
        } catch {
          // Thrown message is server-log only (never sent to the browser) —
          // see CredentialsSignin's own docs on why the client only gets a
          // generic "credentials" code.
          throw new CredentialsSignin(
            `Could not reach the API at ${API_URL}. Is the backend running?`
          );
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message = body?.error?.message ?? `Login failed (HTTP ${res.status}).`;
          throw new CredentialsSignin(message);
        }

        const data = await res.json();

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.full_name,
          organisations: data.organisations,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpires: Date.now() + data.expires_in * 1000,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id as string;
        token.organisations = user.organisations;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      if (trigger === "update" && session?.activeOrganisationId) {
        const membership = token.organisations.find(
          (org) => org.id === session.activeOrganisationId
        );
        if (membership) {
          token.activeOrganisationId = membership.id;
          token.activeOrganisationRole = membership.role;
        }
        return token;
      }

      // 60s buffer so a request in flight doesn't get cut off by expiry
      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.organisations = token.organisations;
      session.activeOrganisationId = token.activeOrganisationId;
      session.activeOrganisationRole = token.activeOrganisationRole;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },
});
