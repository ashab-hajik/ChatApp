import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { createMessage, getMessages, markChatAsRead } from '../services/message.service';
import { chatRoomName } from '../services/chat.service';
import { getIO } from '../sockets/io';
import { SocketEvents } from '../sockets/events';

// POST /api/messages — REST fallback for sending a message without a live socket
// connection. The frontend always sends over the socket (see message.handler.ts) for
// lower latency; this exists so the documented REST contract works standalone too.
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await createMessage({ ...req.body, senderId: req.user!.userId });

  getIO().to(chatRoomName(message.chatId)).emit(SocketEvents.RECEIVE_MESSAGE, message);

  return sendSuccess(res, 201, message);
});

// GET /api/messages?chatId=&cursor=&limit=
export const getMessagesByQuery = asyncHandler(async (req: Request, res: Response) => {
  const { chatId, cursor, limit } = req.query as { chatId?: string; cursor?: string; limit?: string };
  if (!chatId) {
    return res.status(400).json({ success: false, message: 'chatId query parameter is required' });
  }
  const result = await getMessages(chatId, req.user!.userId, { cursor, limit: limit ? Number(limit) : undefined });
  return sendSuccess(res, 200, result);
});

// PUT /api/messages/read
export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await markChatAsRead(req.body.chatId, req.user!.userId);

  if (result.readMessageIds.length > 0) {
    getIO().to(chatRoomName(req.body.chatId)).emit(SocketEvents.MESSAGE_READ, {
      chatId: req.body.chatId,
      userId: req.user!.userId,
      messageIds: result.readMessageIds,
      readAt: new Date().toISOString(),
    });
  }

  return sendSuccess(res, 200, result);
});
