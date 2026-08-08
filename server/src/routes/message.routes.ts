import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { markReadSchema, sendMessageSchema } from '../validations/message.validation';
import { getMessagesByQuery, markRead, sendMessage } from '../controllers/message.controller';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(sendMessageSchema), sendMessage);
router.get('/', getMessagesByQuery);
router.put('/read', validateBody(markReadSchema), markRead);

export default router;
