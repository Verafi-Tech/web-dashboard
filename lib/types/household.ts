export type Household = {
  id: string;
  project_id: string;
  enrolled_by: string;
  household_code: string;
  head_of_household: string | null;
  household_size: number;
  // Server-computed (CC_VM0050 adult-equivalent formula) — display-only,
  // never sent in a create/update request.
  hh_equiv_adults: string | null;
  hh_children_0_14: number | null;
  hh_female_over_14: number | null;
  hh_male_15_59: number | null;
  hh_male_over_59: number | null;
  old_stove_type: string | null;
  primary_fuel_type: string | null;
  // Stores an Upload id (see lib/api/uploads.ts), not a persistent URL —
  // the backend's upload flow only ever hands back presigned, expiring
  // download URLs. Resolve a fresh one on read via getDownloadUrl(id).
  photo_old_stove_url: string | null;
  new_stove_type: string | null;
  stove_serial_number: string | null;
  enrolment_date: string;
  sync_status: string;
  created_at: string;
  updated_at: string;
  // Village/community name — listed in Annex A of the monitoring report.
  community: string | null;
};

// Matches CreateHouseholdRequest. household_code is normally omitted —
// the backend generates it as HH-XXXXXX; only supply one to preserve an
// identifier from an existing paper/legacy register.
// household_size/composition/enrolment_date are immutable after creation —
// see HouseholdUpdateInput.
export type HouseholdInput = {
  household_code?: string;
  head_of_household?: string;
  household_size: number;
  hh_children_0_14?: number;
  hh_female_over_14?: number;
  hh_male_15_59?: number;
  hh_male_over_59?: number;
  old_stove_type?: string;
  primary_fuel_type?: string;
  photo_old_stove_url?: string;
  new_stove_type?: string;
  stove_serial_number?: string;
  enrolment_date: string;
  gps_latitude?: number;
  gps_longitude?: number;
  community?: string;
};

// Matches UpdateHouseholdRequest — deliberately narrower than HouseholdInput.
export type HouseholdUpdateInput = {
  head_of_household?: string;
  old_stove_type?: string;
  primary_fuel_type?: string;
  photo_old_stove_url?: string;
  new_stove_type?: string;
  stove_serial_number?: string;
  community?: string;
};
