import axios from "axios";
import { apiClient } from "@/lib/api/client";
import type {
  Upload,
  UploadStats,
  PresignedUrlInput,
  PresignedUrlResult,
  DownloadUrlResult,
} from "@/lib/types/upload";

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

export async function getPresignedUrl(
  input: PresignedUrlInput,
  organisationId?: string
): Promise<PresignedUrlResult> {
  const res = await apiClient.post<PresignedUrlResult>("/uploads/presigned-url", input, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

// Direct-to-storage PUT against the presigned URL — deliberately NOT
// apiClient. That URL points at S3/MinIO, not our backend: it must not
// carry our Authorization/X-Organisation-ID headers, and a non-2xx here
// must not trigger apiClient's 401-signout interceptor.
export async function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: File
): Promise<void> {
  await axios.put(presignedUrl, file, {
    headers: { "Content-Type": file.type },
  });
}

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function confirmUpload(
  uploadId: string,
  fileHash: string,
  organisationId?: string
): Promise<Upload> {
  const res = await apiClient.post<Upload>(
    `/uploads/${uploadId}/confirm`,
    { file_hash: fileHash },
    { headers: orgHeader(organisationId) }
  );
  return res.data;
}

export async function getDownloadUrl(
  uploadId: string,
  organisationId?: string
): Promise<DownloadUrlResult> {
  const res = await apiClient.get<DownloadUrlResult>(`/uploads/${uploadId}/download-url`, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

// Confirmed against the live OpenAPI schema: a bare array (skip/limit query
// params), unlike /projects and /users which are {data, meta} paginated.
export async function listUploads(
  projectId?: string,
  organisationId?: string
): Promise<Upload[]> {
  const res = await apiClient.get<Upload[]>("/uploads", {
    params: { limit: 100, project_id: projectId },
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function getUploadStats(): Promise<UploadStats> {
  const res = await apiClient.get<UploadStats>("/uploads/stats");
  return res.data;
}

export async function deleteUpload(uploadId: string, organisationId?: string): Promise<void> {
  await apiClient.delete(`/uploads/${uploadId}`, {
    headers: orgHeader(organisationId),
  });
}
