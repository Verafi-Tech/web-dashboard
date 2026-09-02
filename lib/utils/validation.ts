import { z } from "zod";

// Shared helpers for optional numeric form fields. Keep these as plain
// strings at the form layer (matching exactly what a DOM <input> hands
// back) rather than z.coerce/z.preprocess — those make a schema's input
// and output types diverge, which zodResolver's generics don't reconcile
// cleanly against useForm<T>. Convert to a number by hand at submit time
// with toOptionalNumber. First hit in CreateHouseholdDialog (Phase 4),
// reused by SurveyFormDialog (Phase 5) — extract further as it recurs.
export function toOptionalNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

export const optionalNonNegativeString = z
  .string()
  .optional()
  .refine(
    (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Must be 0 or more"
  );

export const optionalNumericString = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), "Must be a number");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const fieldKeySchema = z
  .string()
  .min(1, "Field key is required")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Use letters, numbers, and underscores, starting with a letter"
  );

const baseFieldFields = {
  key: fieldKeySchema,
  label: z.string().min(1, "Label is required"),
  required: z.boolean(),
  help_text: z.string().optional(),
};

export const surveyFieldFormSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("boolean"), ...baseFieldFields }),
  z.object({ type: z.literal("text"), ...baseFieldFields }),
  z.object({ type: z.literal("date"), ...baseFieldFields }),
  z.object({
    type: z.literal("number"),
    ...baseFieldFields,
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  z.object({
    type: z.literal("select"),
    ...baseFieldFields,
    options: z
      .array(z.string().min(1, "Option can't be empty"))
      .min(1, "Add at least one option"),
  }),
]);

export type SurveyFieldFormData = z.infer<typeof surveyFieldFormSchema>;

export const surveyTemplateFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  description: z.string().max(1000).optional(),
  fields: z
    .array(surveyFieldFormSchema)
    .min(1, "At least one field is required")
    .superRefine((fields, ctx) => {
      const seen = new Set<string>();
      fields.forEach((field, index) => {
        if (seen.has(field.key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Field key must be unique",
            path: [index, "key"],
          });
        }
        seen.add(field.key);

        if (
          field.type === "number" &&
          field.min !== undefined &&
          field.max !== undefined &&
          field.min > field.max
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Min must be less than or equal to max",
            path: [index, "max"],
          });
        }
      });
    }),
});

export type SurveyTemplateFormData = z.infer<typeof surveyTemplateFormSchema>;

// VM0050 calculation form — same plain-string-field convention as above.
// Required numeric fields still stay strings at the form layer (for
// consistency with the optional ones, and to dodge the same zodResolver/
// useForm<T> generic-inference conflict), validated with .refine and
// converted by hand in onSubmit.
const requiredNumericString = (message: string) =>
  z.string().min(1, "Required").refine((v) => !Number.isNaN(Number(v)), message);

const requiredNonNegativeString = z
  .string()
  .min(1, "Required")
  .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Must be 0 or more");

const requiredIntegerString = z
  .string()
  .min(1, "Required")
  .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Must be a whole number");

const fuelTypeSchema = z.enum([
  "FIREWOOD",
  "CHARCOAL",
  "LPG",
  "NATURAL_GAS",
  "BIOETHANOL",
  "ELECTRIC",
  "ELECTRIC_CCT",
]);

const fractionString = z
  .string()
  .optional()
  .refine(
    (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 1),
    "Must be between 0 and 1"
  );

export const baselineDeviceFormSchema = z.object({
  device_type_i: z.string().min(1, "Required"),
  fuel_type: fuelTypeSchema,
  ef_co2: optionalNonNegativeString,
  ef_nonco2: optionalNonNegativeString,
  ncv: optionalNonNegativeString,
  eta_old: fractionString,
  charcoal_renewable_fraction: fractionString,
  cct_charging_time_hours: optionalNonNegativeString,
  cct_cooking_duration_hours: optionalNonNegativeString,
});

export const baselineConsumptionFormSchema = z.object({
  baseline_device_i: z.string().min(1, "Required"),
  method: z.enum(["MEASUREMENT_CAMPAIGN", "DEFAULT_VALUES"]),
  bc_ex_ante_b_i: optionalNonNegativeString,
  hh_i: optionalNonNegativeString,
  fuel_type: fuelTypeSchema,
});

export const projectDeviceFormSchema = z.object({
  device_type_j: z.string().min(1, "Required"),
  batch_k: z.string().min(1, "Required"),
  fuel_type: fuelTypeSchema,
  efficiency: requiredNumericString("Must be a number").refine(
    (v) => Number(v) >= 0 && Number(v) <= 1,
    "Must be between 0 and 1"
  ),
  electric_power_w: optionalNonNegativeString,
  electric_grid_emission_factor: optionalNumericString,
  electric_transmission_distribution_loss: fractionString,
  cct_charging_time_hours: optionalNonNegativeString,
  cct_cooking_duration_hours: optionalNonNegativeString,
  cct_specific_heat_capacity: optionalNonNegativeString,
});

export const usageRateFormSchema = z
  .object({
    method: z.enum(["SUMS", "SURVEY"]),
    raw_rate: requiredNonNegativeString,
    // A native <select>'s "not specified" option resolves to "", not
    // undefined — .optional() alone rejects that, so accept "" explicitly too.
    customer_support_level: z
      .union([z.enum(["FULL_SUPPORT", "NO_FULL_SUPPORT"]), z.literal("")])
      .optional(),
    photographic_evidence_collected: z.boolean(),
    lower_ci_used: z.boolean(),
  })
  // Confirmed against the live backend 2026-08-30: survey-based monitoring
  // requires customer_support_level (CC Clarification 2) — the schema marks
  // it optional, but the backend 422s without it for method === "SURVEY".
  .superRefine((data, ctx) => {
    if (data.method === "SURVEY" && !data.customer_support_level) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required for survey-based monitoring",
        path: ["customer_support_level"],
      });
    }
  });

export const monitoringDataFormSchema = z.object({
  device_type_j: z.string().min(1, "Required"),
  batch_k: z.string().min(1, "Required"),
  year_y: requiredIntegerString,
  n_devices: z
    .string()
    .min(1, "Required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, "Must be 1 or more"),
  usage_rate_data: usageRateFormSchema,
  fuel_consumption_kg_per_year: optionalNonNegativeString,
  energy_consumption_mwh_per_year: optionalNonNegativeString,
});

export const calculationFormSchema = z.object({
  year_y: requiredIntegerString,
  children_0_14: requiredIntegerString,
  females_over_14: requiredIntegerString,
  males_15_59: requiredIntegerString,
  males_over_59: requiredIntegerString,
  baseline_devices: z.array(baselineDeviceFormSchema).min(1, "Add at least one baseline device"),
  baseline_consumption: z
    .array(baselineConsumptionFormSchema)
    .min(1, "Add at least one consumption entry"),
  project_devices: z.array(projectDeviceFormSchema).min(1, "Add at least one project device"),
  monitoring_data: z.array(monitoringDataFormSchema).min(1, "Add at least one monitoring entry"),
  pe_transp_y: optionalNonNegativeString,
  pe_prod_y: optionalNonNegativeString,
  pe_fugitive_y: optionalNonNegativeString,
  pe_backup_y: optionalNonNegativeString,
  f_nrb_y: fractionString,
  eta_bl_y: fractionString,
  eta_pj_y: fractionString,
  le_rb_y: optionalNonNegativeString,
});

export type CalculationFormData = z.infer<typeof calculationFormSchema>;
