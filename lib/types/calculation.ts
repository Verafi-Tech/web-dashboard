// Types for VM0050CalculationRequest/Result — see ROADMAP.md §6 Calculations
// and §5 domain glossary for what each field means. Decimal fields come back
// from the backend as strings (arbitrary-precision, not JS floats) — they're
// typed as `string` and only ever displayed, never computed on, client-side.

export type FuelType =
  | "FIREWOOD"
  | "CHARCOAL"
  | "LPG"
  | "NATURAL_GAS"
  | "BIOETHANOL"
  | "ELECTRIC"
  | "ELECTRIC_CCT";

export const FUEL_TYPE_OPTIONS: FuelType[] = [
  "FIREWOOD",
  "CHARCOAL",
  "LPG",
  "NATURAL_GAS",
  "BIOETHANOL",
  "ELECTRIC",
  "ELECTRIC_CCT",
];

export type HouseholdComposition = {
  children_0_14: number;
  females_over_14: number;
  males_15_59: number;
  males_over_59: number;
};

export type BaselineDeviceInput = {
  device_type_i: string;
  fuel_type: FuelType;
  ef_co2?: number;
  ef_nonco2?: number;
  ncv?: number;
  eta_old?: number;
  charcoal_renewable_fraction?: number;
  cct_charging_time_hours?: number;
  cct_cooking_duration_hours?: number;
};

export type BaselineConsumptionInput = {
  baseline_device_i: string;
  method: "MEASUREMENT_CAMPAIGN" | "DEFAULT_VALUES";
  bc_ex_ante_b_i?: number;
  hh_i?: number;
  fuel_type: FuelType;
};

export type ProjectDeviceInput = {
  device_type_j: string;
  batch_k: string;
  fuel_type: FuelType;
  efficiency: number;
  electric_power_w?: number;
  electric_grid_emission_factor?: number;
  electric_transmission_distribution_loss?: number;
  cct_charging_time_hours?: number;
  cct_cooking_duration_hours?: number;
  cct_specific_heat_capacity?: number;
};

export type UsageRateInput = {
  method: "SUMS" | "SURVEY";
  raw_rate: number;
  customer_support_level?: "FULL_SUPPORT" | "NO_FULL_SUPPORT";
  photographic_evidence_collected?: boolean;
  lower_ci_used?: boolean;
};

export type ProjectDeviceMonitoringData = {
  device_type_j: string;
  batch_k: string;
  year_y: number;
  n_devices: number;
  usage_rate_data: UsageRateInput;
  fuel_consumption_kg_per_year?: number;
  energy_consumption_mwh_per_year?: number;
};

export type ProjectEmissionsOtherInput = {
  pe_transp_y?: number;
  pe_prod_y?: number;
  pe_fugitive_y?: number;
  pe_backup_y?: number;
};

export type VM0050CalculationRequest = {
  project_id: string;
  year_y: number;
  household_composition: HouseholdComposition;
  baseline_devices: BaselineDeviceInput[];
  baseline_consumption: BaselineConsumptionInput[];
  project_devices: ProjectDeviceInput[];
  monitoring_data: ProjectDeviceMonitoringData[];
  other_emissions?: ProjectEmissionsOtherInput;
  f_nrb_y?: number;
  eta_bl_y?: number;
  eta_pj_y?: number;
  le_rb_y?: number;
};

// --- Result shapes (all read-only, backend-computed) ---

export type ParameterSource = "PROVIDED" | "IPCC_DEFAULT" | "METHODOLOGY_DEFAULT" | "CALCULATED" | "SURVEY";

export type ParameterAuditEntry = {
  parameter: string;
  symbol: string;
  value: string;
  unit: string;
  source: ParameterSource;
  equations_used_in: string[];
  notes: string | null;
};

export type UsageRateAuditResult = {
  method: string;
  raw_rate: string;
  cap_applied: boolean;
  cap_value: string | null;
  applied_rate: string;
  cc_clarification_2_applied: boolean;
  photographic_evidence_collected: boolean | null;
  lower_ci_used: boolean | null;
};

export type StoveStackingResult = {
  ec_i_y_raw: string;
  ec_p_y: string;
  ec_est_y: string;
  stacking_detected: boolean;
  cap_applied: boolean;
  electric_high_eff_exempt: boolean;
  ec_i_y_final: string;
  explanation: string;
};

export type PerDeviceBaselineContribution = {
  device_type_i: string;
  n_devices: number;
  usage_rate_audit: UsageRateAuditResult;
  ec_i_y_applied: string;
  combined_ef: string;
  be_contribution: string;
  formula_trace: string;
};

export type BaselineEmissionsBreakdown = {
  be_y: string;
  per_device_contributions: PerDeviceBaselineContribution[];
  stove_stacking_result: StoveStackingResult | null;
  consumption_method: string;
  bc_value: string;
  ncv_value: string;
  ec_i_y_final: string;
  ef_co2_combined: string;
  ef_nonco2_combined: string;
  f_nrb_y: string;
};

export type PerDeviceProjectContribution = {
  device_type_j: string;
  batch_k: string;
  calc_path: "EQ_7_BIOMASS" | "EQ_7_FOSSIL" | "EQ_8_ELECTRIC" | "EQ_5_8_CCT";
  n_devices: number;
  usage_rate_applied: string;
  pe_contribution: string;
  formula_trace: string;
};

export type ProjectEmissionsBreakdown = {
  pe_y: string;
  pe_energy_y: string;
  pe_others_y: string;
  pe_transp_y: string;
  pe_prod_y: string;
  pe_fugitive_y: string;
  pe_backup_y: string;
  per_device_contributions: PerDeviceProjectContribution[];
  calc_paths_used: string[];
};

export type NetEmissionReductionsResult = {
  er_y: string;
  be_y: string;
  pe_y: string;
  be_minus_pe: string;
  adjustment_factor: string;
  adjusted_value: string;
  le_rb_y: string;
  formula_trace: string;
};

export type VM0050CalculationResult = {
  project_id: string;
  year_y: number;
  calculated_at: string;
  net_emission_reductions: string;
  baseline_emissions: string;
  project_emissions: string;
  le_rb_y: string;
  leakage_note: string;
  methodology_version: string;
  clarifications_version: string;
  clarifications_applied: string[];
  baseline_emissions_breakdown: BaselineEmissionsBreakdown;
  project_emissions_breakdown: ProjectEmissionsBreakdown;
  emission_reductions_result: NetEmissionReductionsResult;
  parameter_audit_trail: ParameterAuditEntry[];
  warnings: string[];
  errors: string[];
};

export type CalculationStatus = "COMPLETED" | "IN_PROGRESS" | "FAILED";

export type CalculationResponse = {
  calculation_id: string;
  result: VM0050CalculationResult;
  status: CalculationStatus;
  created_at: string;
  updated_at: string;
};

// The list endpoint (GET /projects/{id}/calculations) returns a flat summary
// per row, not the full CalculationResponse — confirmed against the live
// backend 2026-08-30 (undocumented in the OpenAPI schema, which only
// describes this endpoint as `additionalProperties: true`).
export type CalculationSummary = {
  calculation_id: string;
  year: number;
  status: CalculationStatus;
  net_emission_reductions: string;
  baseline_emissions: string;
  project_emissions: string;
  created_at: string;
};
