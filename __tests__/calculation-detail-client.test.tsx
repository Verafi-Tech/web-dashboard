import { render, screen } from "@testing-library/react";
import { CalculationDetailClient } from "@/components/calculations/CalculationDetailClient";
import type { CalculationResponse } from "@/lib/types/calculation";

const mockUseCalculation = jest.fn();

jest.mock("@/hooks/useCalculation", () => ({
  useCalculation: () => mockUseCalculation(),
}));

const calculation: CalculationResponse = {
  calculation_id: "c1",
  status: "COMPLETED",
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
  result: {
    project_id: "p1",
    year_y: 2026,
    calculated_at: "2026-03-01T00:00:00Z",
    net_emission_reductions: "12.5",
    baseline_emissions: "20.0",
    project_emissions: "5.0",
    le_rb_y: "0",
    leakage_note: "No leakage applicable.",
    methodology_version: "v1.0",
    clarifications_version: "v1.0",
    clarifications_applied: ["CC2"],
    baseline_emissions_breakdown: {
      be_y: "20.0",
      per_device_contributions: [
        {
          device_type_i: "three-stone-fire",
          n_devices: 1,
          usage_rate_audit: {
            method: "SURVEY",
            raw_rate: "0.9",
            cap_applied: false,
            cap_value: null,
            applied_rate: "0.9",
            cc_clarification_2_applied: false,
            photographic_evidence_collected: null,
            lower_ci_used: null,
          },
          ec_i_y_applied: "1.2",
          combined_ef: "0.11",
          be_contribution: "20.0",
          formula_trace: "BE = EC x N x n x EF",
        },
      ],
      stove_stacking_result: null,
      consumption_method: "DEFAULT_VALUES",
      bc_value: "1.0",
      ncv_value: "0.015",
      ec_i_y_final: "1.0",
      ef_co2_combined: "0.1",
      ef_nonco2_combined: "0.01",
      f_nrb_y: "0.3",
    },
    project_emissions_breakdown: {
      pe_y: "5.0",
      pe_energy_y: "5.0",
      pe_others_y: "0",
      pe_transp_y: "0",
      pe_prod_y: "0",
      pe_fugitive_y: "0",
      pe_backup_y: "0",
      per_device_contributions: [
        {
          device_type_j: "rocket-stove",
          batch_k: "batch-1",
          calc_path: "EQ_7_BIOMASS",
          n_devices: 10,
          usage_rate_applied: "0.75",
          pe_contribution: "5.0",
          formula_trace: "PE = ...",
        },
      ],
      calc_paths_used: ["EQ_7_BIOMASS"],
    },
    emission_reductions_result: {
      er_y: "12.5",
      be_y: "20.0",
      pe_y: "5.0",
      be_minus_pe: "15.0",
      adjustment_factor: "0.95",
      adjusted_value: "14.25",
      le_rb_y: "0",
      formula_trace: "ER_y = (BE_y - PE_y) x 0.95 - LE_RB,y",
    },
    parameter_audit_trail: [
      {
        parameter: "NCV_FIREWOOD",
        symbol: "NCV_b,i",
        value: "0.015",
        unit: "TJ/kg",
        source: "IPCC_DEFAULT",
        equations_used_in: ["EQ_1"],
        notes: null,
      },
    ],
    warnings: ["Usage rate capped at 0.90 per CC Clarification 2."],
    errors: [],
  },
};

describe("CalculationDetailClient", () => {
  it("renders the summary stats and formula trace", () => {
    mockUseCalculation.mockReturnValue({ data: calculation, isLoading: false, isError: false });
    render(<CalculationDetailClient calculationId="c1" projectId="p1" />);

    expect(screen.getByText(/vm0050 calculation — 2026/i)).toBeInTheDocument();
    expect(screen.getByText("12.5")).toBeInTheDocument();
    expect(screen.getByText(/ER_y = \(BE_y - PE_y\)/)).toBeInTheDocument();
  });

  it("shows warnings when present", () => {
    mockUseCalculation.mockReturnValue({ data: calculation, isLoading: false, isError: false });
    render(<CalculationDetailClient calculationId="c1" projectId="p1" />);

    expect(screen.getByText(/usage rate capped at 0\.90/i)).toBeInTheDocument();
  });

  it("shows the per-device baseline contribution row", () => {
    mockUseCalculation.mockReturnValue({ data: calculation, isLoading: false, isError: false });
    render(<CalculationDetailClient calculationId="c1" projectId="p1" />);

    expect(screen.getByText("three-stone-fire")).toBeInTheDocument();
  });

  it("shows a failed-to-load state", () => {
    mockUseCalculation.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("not found"),
    });
    render(<CalculationDetailClient calculationId="c1" projectId="p1" />);

    expect(screen.getByText(/failed to load calculation/i)).toBeInTheDocument();
  });
});
