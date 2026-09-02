import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Survey } from "@/lib/types/survey";

export function SurveysTable({
  data,
  canManage,
  onEdit,
  onDelete,
}: {
  data: Survey[];
  canManage: boolean;
  onEdit: (survey: Survey) => void;
  onDelete: (survey: Survey) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Stove status
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Fuel
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Notes
            </th>
            {canManage && <th className="px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {data.map((survey) => (
            <tr key={survey.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3 text-foreground">
                {new Date(survey.survey_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant={survey.stove_in_use ? "success" : "danger"}>
                    {survey.stove_in_use ? "In use" : "Not in use"}
                  </Badge>
                  <Badge variant={survey.stove_in_good_condition ? "success" : "warn"}>
                    {survey.stove_in_good_condition ? "Good condition" : "Needs repair"}
                  </Badge>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {survey.primary_fuel_used || "—"}
              </td>
              <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                {survey.notes || "—"}
              </td>
              {canManage && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit survey from ${survey.survey_date}`}
                      onClick={() => onEdit(survey)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete survey from ${survey.survey_date}`}
                      onClick={() => onDelete(survey)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
