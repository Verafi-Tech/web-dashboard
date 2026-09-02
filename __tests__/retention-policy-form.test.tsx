import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RetentionPolicyForm } from "@/components/settings/RetentionPolicyForm";
import type { RetentionPolicy } from "@/lib/types/audit";

const mockMutateAsync = jest.fn();

jest.mock("@/hooks/useRetentionPolicy", () => ({
  useSetRetentionPolicy: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

const policy: RetentionPolicy = {
  id: "p1",
  organisation_id: "org-1",
  policy_type: "GLOBAL",
  action_type: null,
  entity_type: null,
  retention_days: 365,
  auto_delete: true,
  anonymize_on_delete: false,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
};

beforeEach(() => {
  mockMutateAsync.mockReset();
});

describe("RetentionPolicyForm", () => {
  it("hides scope-specific fields for a GLOBAL policy and submits without them", async () => {
    mockMutateAsync.mockResolvedValue(policy);
    render(<RetentionPolicyForm />);

    expect(screen.queryByLabelText(/^action$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/entity type/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /set policy/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          policy_type: "GLOBAL",
          action_type: undefined,
          entity_type: undefined,
          retention_days: 365,
          auto_delete: true,
          anonymize_on_delete: false,
        })
      );
    });
    expect(await screen.findByText(/policy set: all records/i)).toBeInTheDocument();
  });

  it("requires an action when scoped BY_ACTION", async () => {
    render(<RetentionPolicyForm />);

    fireEvent.change(screen.getByLabelText(/policy scope/i), {
      target: { value: "BY_ACTION" },
    });
    expect(screen.getByLabelText(/^action$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /set policy/i }));

    expect(
      await screen.findByText(/required for an action-scoped policy/i)
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("submits an entity-scoped policy with the selected entity type", async () => {
    mockMutateAsync.mockResolvedValue({ ...policy, policy_type: "BY_ENTITY_TYPE", entity_type: "HOUSEHOLD" });
    render(<RetentionPolicyForm />);

    fireEvent.change(screen.getByLabelText(/policy scope/i), {
      target: { value: "BY_ENTITY_TYPE" },
    });
    fireEvent.change(screen.getByLabelText(/entity type/i), {
      target: { value: "HOUSEHOLD" },
    });
    fireEvent.click(screen.getByRole("button", { name: /set policy/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ policy_type: "BY_ENTITY_TYPE", entity_type: "HOUSEHOLD" })
      );
    });
  });

  it("rejects a retention period outside 7-2555 days", async () => {
    render(<RetentionPolicyForm />);

    fireEvent.change(screen.getByLabelText(/retention days/i), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /set policy/i }));

    expect(await screen.findByText(/must be between 7 and 2555 days/i)).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
