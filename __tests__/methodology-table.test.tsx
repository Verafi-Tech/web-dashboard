import { render, screen, fireEvent } from "@testing-library/react";
import { MethodologyTable } from "@/components/methodologies/MethodologyTable";
import type { Methodology } from "@/lib/types/methodology";

const data: Methodology[] = [
  {
    id: "1",
    code: "VM0050",
    version: "1.0",
    name: "Improved Cookstove Programme",
    standard: "Verra",
    parameters: {},
  },
  {
    id: "2",
    code: "ACM0015",
    version: "2.0",
    name: "Sustainable Forestry",
    standard: "Gold Standard",
    parameters: {},
  },
];

describe("MethodologyTable", () => {
  it("renders a row per methodology with a View link", () => {
    render(<MethodologyTable data={data} />);

    expect(screen.getByText("Improved Cookstove Programme")).toBeInTheDocument();
    expect(screen.getByText("Sustainable Forestry")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View" })[0]).toHaveAttribute(
      "href",
      "/dashboard/methodologies/1"
    );
  });

  it("filters by search term across code and name", () => {
    render(<MethodologyTable data={data} />);

    fireEvent.change(screen.getByPlaceholderText(/search by code or name/i), {
      target: { value: "ACM0015" },
    });

    expect(screen.queryByText("Improved Cookstove Programme")).not.toBeInTheDocument();
    expect(screen.getByText("Sustainable Forestry")).toBeInTheDocument();
  });

  it("filters by standard", () => {
    render(<MethodologyTable data={data} />);

    fireEvent.change(screen.getByDisplayValue("All standards"), {
      target: { value: "Gold Standard" },
    });

    expect(screen.queryByText("Improved Cookstove Programme")).not.toBeInTheDocument();
    expect(screen.getByText("Sustainable Forestry")).toBeInTheDocument();
  });

  it("shows an empty message when no rows match", () => {
    render(<MethodologyTable data={data} />);

    fireEvent.change(screen.getByPlaceholderText(/search by code or name/i), {
      target: { value: "nonexistent" },
    });

    expect(screen.getByText(/no methodologies match your filters/i)).toBeInTheDocument();
  });
});
