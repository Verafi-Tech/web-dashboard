import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPresignedUrl,
  uploadFileToPresignedUrl,
  hashFile,
  confirmUpload,
  listUploads,
  getUploadStats,
  deleteUpload,
  getDownloadUrl,
} from "@/lib/api/uploads";
import { getErrorMessage } from "@/lib/utils/errors";
import type { Upload } from "@/lib/types/upload";

export function useUploads(projectId?: string, organisationId?: string) {
  return useQuery({
    queryKey: ["uploads", projectId ?? null],
    queryFn: () => listUploads(projectId, organisationId),
  });
}

export function useUploadStats() {
  return useQuery({
    queryKey: ["upload-stats"],
    queryFn: getUploadStats,
  });
}

// Full presigned-URL flow in one call: request a URL, PUT the file directly
// to storage, hash it, then confirm with the backend. See lib/api/uploads.ts
// for why the PUT itself bypasses apiClient. projectId ties the upload to
// project evidence (household/survey photos) per PresignedUrlInput's own
// field description — omit only for genuinely organisation-level files.
export function useUploadFile(projectId?: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    // Each step is rethrown with a stage label — the four steps here (ask
    // for a URL, PUT to storage, hash, confirm) hit three different hosts
    // and failure modes, and collapsing them into one generic message made
    // a real storage-upload bug (CORS/wrong host/etc.) impossible to
    // distinguish from a hashing or confirm failure. See getErrorMessage,
    // which now surfaces a plain Error's .message instead of discarding it.
    mutationFn: async (file: File): Promise<Upload> => {
      let presigned;
      try {
        presigned = await getPresignedUrl(
          { filename: file.name, mime_type: file.type, file_size: file.size, project_id: projectId },
          organisationId
        );
      } catch (err) {
        throw new Error(`Could not request an upload URL: ${getErrorMessage(err)}`);
      }

      try {
        await uploadFileToPresignedUrl(presigned.presigned_url, file);
      } catch (err) {
        throw new Error(`Uploading to storage failed: ${getErrorMessage(err)}`);
      }

      let fileHash: string;
      try {
        fileHash = await hashFile(file);
      } catch (err) {
        throw new Error(`Could not verify the file: ${getErrorMessage(err)}`);
      }

      try {
        return await confirmUpload(presigned.upload_id, fileHash, organisationId);
      } catch (err) {
        throw new Error(`Could not confirm the upload: ${getErrorMessage(err)}`);
      }
    },
    onSuccess: () => {
      // Prefix match (TanStack Query's default): invalidates every
      // ["uploads", *] list, not just this one — a new upload can show up
      // in both a project-scoped view and the org-wide Settings list.
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["upload-stats"] });
    },
  });
}

// Resolves a fresh presigned download URL for an already-uploaded file —
// used by FileUpload to preview a photo that was uploaded in a previous
// session (all we ever persist is the upload id, never a stable URL).
export function useDownloadUrl(uploadId?: string, organisationId?: string) {
  return useQuery({
    queryKey: ["upload-download-url", uploadId],
    queryFn: () => getDownloadUrl(uploadId as string, organisationId),
    enabled: !!uploadId,
  });
}

export function useDeleteUpload(organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uploadId: string) => deleteUpload(uploadId, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["upload-stats"] });
    },
  });
}
