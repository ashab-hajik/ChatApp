import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

// GET /api/files/:filename — intentionally not behind `authenticate`: stored filenames
// are random UUIDs, and <img> tags / anchor downloads can't attach an Authorization
// header, so this route is protected by unguessability rather than a session check.
export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename); // strip any path traversal attempt
  const filePath = path.resolve(process.cwd(), env.uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    throw ApiError.notFound('File not found');
  }

  const downloadName = req.query.name;
  if (typeof downloadName === 'string' && downloadName.trim()) {
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
  }

  return res.sendFile(filePath);
});
