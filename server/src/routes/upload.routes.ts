import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { upload } from '../config/multer';
import { uploadFile } from '../controllers/upload.controller';

const router = Router();

router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
