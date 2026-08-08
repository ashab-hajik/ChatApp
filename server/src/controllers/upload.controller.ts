import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// POST /api/upload — expects a single multipart field named "file" (see upload.routes.ts
// for the Multer middleware that parses it and enforces type/size limits).
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file was uploaded');
  }

  const isImage = req.file.mimetype.startsWith('image/');

  return sendSuccess(res, 201, {
    fileUrl: `/api/files/${req.file.filename}`,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    type: isImage ? 'IMAGE' : 'FILE',
  });
});
