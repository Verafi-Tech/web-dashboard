export type Organisation = {
  id: string;
  name: string;
  description?: string;
  // Host country, appears on the VVB monitoring report.
  country: string | null;
  // Server-generated tenant code — how a field agent finds this org at
  // login (see OrganisationByCodeResponse). Read-only, never sent by the
  // client.
  code: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganisationInput = {
  name: string;
  description?: string;
  country?: string;
};
