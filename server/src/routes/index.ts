import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import chatMessagesRoutes from './chatMessages.routes';
import messageRoutes from './message.routes';
import uploadRoutes from './upload.routes';
import fileRoutes from './file.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/chat', chatMessagesRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);
router.use('/files', fileRoutes);

export default router;
