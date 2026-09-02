import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldBuilder } from "@/components/methodologies/FieldBuilder";
import {
  surveyTemplateFormSchema,
  type SurveyTemplateFormData,
} from "@/lib/utils/validation";

function TestHarness() {
  const form = useForm<SurveyTemplateFormData>({
    resolver: zodResolver(surveyTemplateFormSchema),
    defaultValues: { name: "Test", description: "", fields: [] },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FieldBuilder />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("FieldBuilder", () => {
  it("shows an empty state with no fields", () => {
    render(<TestHarness />);
    expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();
  });

  it("adds a field row when a type button is clicked", () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "boolean" }));

    expect(screen.queryByText(/no fields yet/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("field_key")).toBeInTheDocument();
  });

  it("shows the options editor only for select fields", () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "select" }));

    expect(screen.getByText(/options/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add option/i })).toBeInTheDocument();
  });

  it("shows min/max inputs only for number fields", () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "number" }));

    expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();
  });

  it("removes a field row when its remove button is clicked", () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "text" }));
    expect(screen.getByPlaceholderText("field_key")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove field/i }));
    expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();
  });

  it("shows a validation error for an empty label on submit", async () => {
    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "text" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(/label is required/i)).toBeInTheDocument();
  });
});
