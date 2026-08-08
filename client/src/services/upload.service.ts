import { api } from './api';
import { ApiSuccess } from '../types/api';
import { MessageType } from '../types/message';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  type: MessageType;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ApiSuccess<UploadResult>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
