import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createPrivateChatSchema } from '../validations/chat.validation';
import { addMembersSchema, createGroupSchema, updateGroupSchema } from '../validations/group.validation';
import {
  addMembers,
  createGroup,
  createPrivateChat,
  deleteChat,
  getChat,
  leaveGroupChat,
  listChats,
  removeMember,
  updateGroup,
} from '../controllers/chat.controller';

// Mounted at /api/chats — matches the spec's plural "Chats" API group
// (POST /chats/private, POST /chats/group, GET /chats). The singular
// GET /chat/:id/messages route lives in chatMessages.routes.ts.
const router = Router();

router.use(authenticate);

router.post('/private', validateBody(createPrivateChatSchema), createPrivateChat);
router.post('/group', validateBody(createGroupSchema), createGroup);
router.get('/', listChats);
router.get('/:id', getChat);
router.put('/:id', validateBody(updateGroupSchema), updateGroup);
router.delete('/:id', deleteChat);
router.post('/:id/members', validateBody(addMembersSchema), addMembers);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/leave', leaveGroupChat);

export default router;
