"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useUploads, useDeleteUpload } from "@/hooks/useUpload";
import { getErrorMessage } from "@/lib/utils/errors";
import { formatBytes } from "@/lib/utils/format";
import { FileText, Trash2 } from "lucide-react";
import type { Upload } from "@/lib/types/upload";

export function UploadsList({
  projectId,
  organisationId,
  canManage = true,
}: {
  // Omit for the org-wide Settings view; pass a project's id to scope the
  // list to that project's evidence uploads (household/survey photos).
  projectId?: string;
  organisationId?: string;
  canManage?: boolean;
}) {
  const { data, isLoading, isError, error } = useUploads(projectId, organisationId);
  const [deleteTarget, setDeleteTarget] = useState<Upload | null>(null);
  const deleteMutation = useDeleteUpload(organisationId);

  async function onDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Dialog stays open on failure so the user sees it didn't go through.
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={FileText}
        title="Failed to load uploads"
        description={getErrorMessage(error)}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No files uploaded yet"
        description={
          projectId
            ? "Files uploaded for this project will show up here."
            : "Files uploaded across the organisation will show up here."
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                File
              </th>
              <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                Size
              </th>
              <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                Uploaded by
              </th>
              <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                Uploaded
              </th>
              {canManage && <th className="px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {data.map((upload) => (
              <tr key={upload.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">
                    {upload.original_filename}
                  </div>
                  <div className="text-xs text-muted-foreground">{upload.mime_type}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatBytes(upload.file_size)}
                </td>
                <td className="px-4 py-3">
                  {upload.uploaded_by ? (
                    <>
                      <div className="text-foreground">{upload.uploaded_by.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {upload.uploaded_by.email}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(upload.created_at).toLocaleDateString()}
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${upload.original_filename}`}
                      onClick={() => setDeleteTarget(upload)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete file"
        description={
          deleteTarget
            ? `This permanently deletes "${deleteTarget.original_filename}". This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
