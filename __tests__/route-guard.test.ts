import { getRedirectForRequest } from "@/lib/auth/route-guard";

describe("getRedirectForRequest", () => {
  it("sends unauthenticated users away from /dashboard to /login", () => {
    expect(getRedirectForRequest("/dashboard", null)).toBe("/login");
  });

  it("sends authenticated users with no active org to /select-organisation", () => {
    expect(getRedirectForRequest("/dashboard", {})).toBe(
      "/select-organisation"
    );
  });

  it("lets non-admin sessions with an active org through to /dashboard", () => {
    expect(
      getRedirectForRequest("/dashboard", {
        activeOrganisationId: "org-1",
        activeOrganisationRole: "viewer",
      })
    ).toBeNull();
  });

  it("lets admin-in-active-org sessions through to /dashboard", () => {
    expect(
      getRedirectForRequest("/dashboard", {
        activeOrganisationId: "org-1",
        activeOrganisationRole: "admin",
      })
    ).toBeNull();
  });

  it("sends authenticated sessions with no active org to /select-organisation regardless of role", () => {
    expect(
      getRedirectForRequest("/dashboard", { activeOrganisationRole: "admin" })
    ).toBe("/select-organisation");
  });

  it("sends authenticated sessions with an active org away from /login to /dashboard", () => {
    expect(
      getRedirectForRequest("/login", {
        activeOrganisationId: "org-1",
        activeOrganisationRole: "admin",
      })
    ).toBe("/dashboard");
  });

  it("sends authenticated sessions with no active org away from /login to /select-organisation", () => {
    expect(getRedirectForRequest("/login", {})).toBe("/select-organisation");
  });

  it("leaves unauthenticated users on /login", () => {
    expect(getRedirectForRequest("/login", null)).toBeNull();
  });

  it("sends unauthenticated users from / to /login", () => {
    expect(getRedirectForRequest("/", null)).toBe("/login");
  });

  it("lets authenticated users reach /select-organisation regardless of role", () => {
    expect(getRedirectForRequest("/select-organisation", {})).toBeNull();
  });

  it("sends unauthenticated users away from /select-organisation to /login", () => {
    expect(getRedirectForRequest("/select-organisation", null)).toBe(
      "/login"
    );
  });
});
