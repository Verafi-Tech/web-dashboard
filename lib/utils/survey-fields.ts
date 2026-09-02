import type { SurveyFieldFormData } from "@/lib/utils/validation";
import type { SurveyFieldDefinition, SurveyFields } from "@/lib/types/methodology";

export function fieldsRecordToArray(fields: SurveyFields): SurveyFieldFormData[] {
  return Object.entries(fields).map(
    ([key, def]) => ({ key, ...def }) as SurveyFieldFormData
  );
}

export function fieldsArrayToRecord(fields: SurveyFieldFormData[]): SurveyFields {
  const record: SurveyFields = {};
  for (const { key, ...def } of fields) {
    record[key] = def as SurveyFieldDefinition;
  }
  return record;
}
