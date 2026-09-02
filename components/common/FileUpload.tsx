"use client";

import { useEffect, useRef, useState } from "react";
import { useUploadFile, useDownloadUrl } from "@/hooks/useUpload";
import { getErrorMessage } from "@/lib/utils/errors";
import type { Upload } from "@/lib/types/upload";
import { UploadCloud } from "lucide-react";

// Reusable presigned-URL upload flow, rendered as an image tile: empty
// state is a dashed drop-zone, a photo (freshly picked or previously
// uploaded) fills the tile, and hovering it reveals a "Change photo"
// overlay — clicking anywhere on the tile always opens the file picker.
// Deliberately stops at "here's the confirmed upload" — it's the caller's
// job to decide what to do with the result (e.g. Households/Surveys forms
// turning it into a photo_*_url field).
export function FileUpload({
  label = "Upload a photo",
  accept,
  projectId,
  organisationId,
  // An upload id already on record (editing a household/survey that has a
  // photo from a previous session) — resolved to a fresh preview URL,
  // since all that's ever persisted is the id, not a stable URL.
  existingUploadId,
  onUploaded,
}: {
  label?: string;
  accept?: string;
  projectId?: string;
  organisationId?: string;
  existingUploadId?: string | null;
  onUploaded: (upload: Upload) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadFile(projectId, organisationId);
  const existingDownload = useDownloadUrl(existingUploadId ?? undefined, organisationId);

  // A freshly-picked file's local preview always wins over a fetched one —
  // it's the same bytes, no need to wait on the network for it.
  const displayUrl = previewUrl ?? existingDownload.data?.download_url ?? null;

  // Revoke the object URL when replaced or on unmount so it doesn't leak.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const upload = await uploadMutation.mutateAsync(file);
      onUploaded(upload);
    } catch (err) {
      setError(getErrorMessage(err));
      setPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={uploadMutation.isPending}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-dashed border-input bg-muted/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- a
                presigned/blob URL, not something next/image can optimize */}
            <img
              src={displayUrl}
              alt={label}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/55 group-hover:opacity-100">
              <span className="text-xs font-bold text-white">
                {uploadMutation.isPending ? "Uploading…" : "Change photo"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <UploadCloud className="size-5" />
            <span className="text-xs font-semibold">
              {uploadMutation.isPending ? "Uploading…" : label}
            </span>
          </div>
        )}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
