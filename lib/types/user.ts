export type UserRole = "admin" | "field_agent" | "viewer";

export type OrgUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organisation_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateUserInput = {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
};

export type InviteUserInput = {
  email: string;
  role: UserRole;
};

export type InviteUserResult = {
  user: OrgUser;
  // null when the invited email already belonged to an existing user —
  // their existing password is unchanged, so there's nothing new to share.
  temporary_password: string | null;
};
