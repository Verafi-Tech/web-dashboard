export type Survey = {
  id: string;
  household_id: string;
  surveyed_by: string;
  survey_date: string;
  stove_in_use: boolean;
  stove_used_regularly: boolean;
  stove_in_good_condition: boolean;
  primary_fuel_used: string | null;
  old_stove_still_used: boolean;
  meals_on_project_stove: number | null;
  meals_on_baseline_stove: number | null;
  // Decimal-as-string in the response; a plain number is fine on write.
  firewood_kg_per_week: string | null;
  // Stores an Upload id (see lib/api/uploads.ts), not a persistent URL —
  // same documented assumption as Household.photo_old_stove_url.
  photo_stove_url: string | null;
  photo_cooking_area_url: string | null;
  notes: string | null;
  sync_status: string;
  created_at: string;
  updated_at: string;
};

// Matches CreateSurveyRequest.
export type SurveyInput = {
  survey_date: string;
  stove_in_use: boolean;
  stove_used_regularly: boolean;
  stove_in_good_condition: boolean;
  primary_fuel_used?: string;
  old_stove_still_used: boolean;
  meals_on_project_stove?: number;
  meals_on_baseline_stove?: number;
  firewood_kg_per_week?: number;
  photo_stove_url?: string;
  photo_cooking_area_url?: string;
  notes?: string;
};

// UpdateSurveyRequest mirrors CreateSurveyRequest exactly, just fully optional.
export type SurveyUpdateInput = Partial<SurveyInput>;
