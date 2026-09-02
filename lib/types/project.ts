export type ProjectStatus = "active" | "completed" | "archived";

export type Project = {
  id: string;
  organisation_id: string;
  name: string;
  methodology_id: string;
  country: string;
  state: string | null;
  // WKT POINT string, e.g. "POINT(3.1357 6.5244)" — not human-readable as-is.
  location: string | null;
  start_date: string;
  status: ProjectStatus;
  verra_project_id: string | null;
  // Report-facing fields, distinct from the operational fields above.
  description: string | null;
  location_description: string | null;
  scale_category: string | null;
  crediting_period_start: string | null;
  crediting_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  name: string;
  methodology_code: string;
  country?: string;
  state?: string;
  location?: string;
  start_date: string;
  description?: string;
  location_description?: string;
  scale_category?: string;
  crediting_period_start?: string;
  crediting_period_end?: string;
};

// All fields optional, per UpdateProjectRequest — a PATCH, not a full replace.
export type ProjectUpdateInput = Partial<ProjectInput> & {
  status?: ProjectStatus;
  verra_project_id?: string;
};

export type ProjectMember = {
  project_id: string;
  user_id: string;
  assigned_at: string;
};
