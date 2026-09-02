export type UploadedBy = {
  id: string;
  full_name: string;
  email: string;
};

export type Upload = {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  // null means an organisation-level file, not tied to any project.
  project_id: string | null;
  uploaded_by: UploadedBy | null;
};

export type UploadStats = {
  total_storage_used: number;
  storage_quota: number;
  file_count: number;
  quota_percentage: number;
};

export type PresignedUrlInput = {
  filename: string;
  mime_type: string;
  file_size: number;
  // Required for project evidence (household/survey photos); omit only for
  // genuinely organisation-level files.
  project_id?: string;
};

export type PresignedUrlResult = {
  upload_id: string;
  presigned_url: string;
  expires_in: number;
};

export type DownloadUrlResult = {
  download_url: string;
  expires_in: number;
  filename: string;
};
