import type { DefaultSession } from "next-auth";

export type UserRole = "admin" | "field_agent" | "viewer";

export type OrganisationMembership = {
  id: string;
  name: string;
  role: UserRole;
};

declare module "next-auth" {
  interface User {
    organisations: OrganisationMembership[];
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    user: DefaultSession["user"] & { id: string };
    organisations: OrganisationMembership[];
    activeOrganisationId?: string;
    activeOrganisationRole?: UserRole;
    accessToken: string;
    refreshToken: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    organisations: OrganisationMembership[];
    activeOrganisationId?: string;
    activeOrganisationRole?: UserRole;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}
