import { render, screen, fireEvent } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { OrganisationsListClient } from "@/components/organisations/OrganisationsListClient";

const mockUseSession = jest.fn();
const mockCreateMutateAsync = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/hooks/useOrganisation", () => ({
  useCreateOrganisation: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

beforeEach(() => {
  mockCreateMutateAsync.mockReset();
});

describe("OrganisationsListClient", () => {
  it("shows an empty state when the user belongs to no organisations", () => {
    mockUseSession.mockReturnValue({ data: { organisations: [] } });
    render(<OrganisationsListClient />);

    expect(screen.getByText(/no organisations yet/i)).toBeInTheDocument();
  });

  it("lists organisations from the session with role badges and view links", () => {
    mockUseSession.mockReturnValue({
      data: {
        organisations: [
          { id: "org-1", name: "Verafi Super Admin", role: "admin" },
          { id: "org-2", name: "Field Partner Co", role: "viewer" },
        ],
      },
    });
    render(<OrganisationsListClient />);

    expect(screen.getByText("Verafi Super Admin")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("viewer")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "View" })[0]
    ).toHaveAttribute("href", "/dashboard/organisations/org-1");
  });

  it("opens the create organisation dialog", () => {
    mockUseSession.mockReturnValue({ data: { organisations: [] } });
    render(<OrganisationsListClient />);

    fireEvent.click(screen.getByRole("button", { name: /new organisation/i }));

    expect(screen.getByText(/creates a new organisation/i)).toBeInTheDocument();
  });
});
