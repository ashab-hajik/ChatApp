import { Router } from 'express';
import { getFile } from '../controllers/file.controller';

const router = Router();

router.get('/:filename', getFile);

export default router;
