import { apiClient } from "@/lib/api/client";

// Public endpoint — no org header needed, but going through the shared
// apiClient is harmless (it just won't find a token to attach for a
// logged-out caller; for a logged-in one requesting their own reset it
// attaches fine and is ignored by the backend).
export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post("/auth/request-password-reset", { email });
}
