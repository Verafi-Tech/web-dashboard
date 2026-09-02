export type FieldType = "boolean" | "number" | "text" | "select" | "date";

export type SurveyFieldDefinition = {
  type: FieldType;
  required: boolean;
  label: string;
  help_text?: string;
  options?: string[];
  min?: number;
  max?: number;
};

export type SurveyFields = Record<string, SurveyFieldDefinition>;

export type Methodology = {
  id: string;
  code: string;
  version: string;
  name: string;
  standard: string;
  parameters: Record<string, unknown>;
  is_active?: boolean;
};

export type SurveyTemplate = {
  id: string;
  methodology_id: string;
  methodology_code?: string;
  methodology_name?: string;
  name: string;
  description: string;
  fields: SurveyFields;
  created_at: string;
  updated_at: string;
};

export type SurveyTemplateInput = {
  name: string;
  description?: string;
  fields: SurveyFields;
};
