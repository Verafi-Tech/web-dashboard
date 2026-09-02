import { surveyTemplateFormSchema } from "@/lib/utils/validation";

function baseTemplate(fields: unknown[]) {
  return { name: "Cookstove Survey", description: "desc", fields };
}

describe("surveyTemplateFormSchema", () => {
  it("accepts a valid boolean field", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        { key: "stove_in_use", type: "boolean", label: "In use?", required: true },
      ])
    );
    expect(result.success).toBe(true);
  });

  it("accepts a number field with min <= max", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        { key: "fuel_kg", type: "number", label: "Fuel", required: false, min: 0, max: 10 },
      ])
    );
    expect(result.success).toBe(true);
  });

  it("rejects a number field with min > max", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        { key: "fuel_kg", type: "number", label: "Fuel", required: false, min: 10, max: 0 },
      ])
    );
    expect(result.success).toBe(false);
  });

  it("rejects a select field with no options", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        { key: "condition", type: "select", label: "Condition", required: true, options: [] },
      ])
    );
    expect(result.success).toBe(false);
  });

  it("accepts a select field with options", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        {
          key: "condition",
          type: "select",
          label: "Condition",
          required: true,
          options: ["good", "fair", "poor"],
        },
      ])
    );
    expect(result.success).toBe(true);
  });

  it("rejects duplicate field keys", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        { key: "stove_in_use", type: "boolean", label: "A", required: true },
        { key: "stove_in_use", type: "boolean", label: "B", required: false },
      ])
    );
    expect(result.success).toBe(false);
  });

  it("rejects an empty fields array", () => {
    const result = surveyTemplateFormSchema.safeParse(baseTemplate([]));
    expect(result.success).toBe(false);
  });

  it("rejects a field key with invalid characters", () => {
    const result = surveyTemplateFormSchema.safeParse(
      baseTemplate([
        { key: "1-bad-key", type: "boolean", label: "A", required: true },
      ])
    );
    expect(result.success).toBe(false);
  });
});
