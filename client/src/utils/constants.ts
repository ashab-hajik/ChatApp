export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// File URLs returned by the API are root-relative (e.g. "/api/files/xyz.png"); the API
// runs on a different origin than the Vite dev server, so they need this prefix.
// Already-absolute URLs (e.g. Google profile pictures) are returned as-is.
export function toAbsoluteFileUrl(fileUrl: string) {
  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  return `${SOCKET_URL}${fileUrl}`;
}

// Mirrors the server's Multer fileFilter allow-list.
export const ACCEPTED_UPLOAD_TYPES =
  '.jpg,.jpeg,.png,.pdf,.docx,.zip,image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip';

