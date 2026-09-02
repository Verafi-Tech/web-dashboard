import { getSession } from "next-auth/react";
import { apiClient } from "@/lib/api/client";

jest.mock("next-auth/react", () => ({
  getSession: jest.fn(),
  signOut: jest.fn(),
}));

const getSessionMock = getSession as jest.Mock;

// Axios doesn't expose a public way to invoke a registered interceptor
// directly, so grab it off the internal handlers array.
function requestInterceptor() {
  return (apiClient.interceptors.request as unknown as {
    handlers: { fulfilled: (config: never) => unknown }[];
  }).handlers[0].fulfilled;
}

describe("apiClient request interceptor", () => {
  it("attaches the active organisation as X-Organisation-ID when none is set", async () => {
    getSessionMock.mockResolvedValue({
      accessToken: "token-123",
      activeOrganisationId: "org-active",
    });

    const config = await requestInterceptor()({ headers: {} } as never);

    expect((config as { headers: Record<string, string> }).headers["X-Organisation-ID"]).toBe(
      "org-active"
    );
  });

  it("does not override an explicitly set X-Organisation-ID", async () => {
    getSessionMock.mockResolvedValue({
      accessToken: "token-123",
      activeOrganisationId: "org-active",
    });

    const config = await requestInterceptor()({
      headers: { "X-Organisation-ID": "org-explicit" },
    } as never);

    expect((config as { headers: Record<string, string> }).headers["X-Organisation-ID"]).toBe(
      "org-explicit"
    );
  });
});
