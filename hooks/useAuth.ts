import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/lib/api/auth";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}
