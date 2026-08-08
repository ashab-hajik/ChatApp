import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { validateQuery } from '../middleware/validate.middleware';
import { messagesQuerySchema } from '../validations/chat.validation';
import { getChatMessages, getMessagesAroundHandler, searchChatMessages } from '../controllers/chat.controller';

// Mounted at /api/chat (singular) — matches the spec's GET /chat/:id/messages exactly.
const router = Router();

router.use(authenticate);
router.get('/:id/messages', validateQuery(messagesQuerySchema), getChatMessages);
router.get('/:id/messages/search', searchChatMessages);
router.get('/:id/messages/around/:messageId', getMessagesAroundHandler);

export default router;
