import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import {
  addGroupMembers,
  chatRoomName,
  createGroupChat,
  deleteChatForUser,
  getChatForUser,
  getOrCreatePrivateChat,
  leaveGroup,
  listChatsForUser,
  removeGroupMember,
  updateGroupInfo,
} from '../services/chat.service';
import { getMessages, getMessagesAround, searchMessagesInChat } from '../services/message.service';
import { ApiError } from '../utils/ApiError';
import { getIO } from '../sockets/io';
import { getSocketIdsForUsers } from '../sockets/presence.service';

// Socket.IO can join specific sockets to a room without a live "socket" in this request —
// each connected socket implicitly has a room equal to its own id, so `io.in(socketIds)`
// targets exactly those connections.
function joinMembersToRoom(chatId: string, userIds: string[]) {
  const socketIds = getSocketIdsForUsers(userIds);
  if (socketIds.length > 0) {
    getIO().in(socketIds).socketsJoin(chatRoomName(chatId));
  }
}

// POST /api/chats/private
export const createPrivateChat = asyncHandler(async (req: Request, res: Response) => {
  const chat = await getOrCreatePrivateChat(req.user!.userId, req.body.userId);
  joinMembersToRoom(chat.id, [req.user!.userId, req.body.userId]);
  const fullChat = await getChatForUser(chat.id, req.user!.userId);
  return sendSuccess(res, 201, fullChat);
});

// POST /api/chats/group
export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const chat = await createGroupChat(req.user!.userId, req.body);
  joinMembersToRoom(chat.id, [req.user!.userId, ...req.body.memberIds]);
  const fullChat = await getChatForUser(chat.id, req.user!.userId);
  return sendSuccess(res, 201, fullChat);
});

// PUT /api/chats/:id
export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const chat = await updateGroupInfo(req.params.id, req.user!.userId, req.body);
  getIO().to(chatRoomName(req.params.id)).emit('group_updated', chat);
  return sendSuccess(res, 200, chat, 'Group updated');
});

// POST /api/chats/:id/members
export const addMembers = asyncHandler(async (req: Request, res: Response) => {
  const chat = await addGroupMembers(req.params.id, req.user!.userId, req.body.memberIds);
  joinMembersToRoom(req.params.id, req.body.memberIds);
  getIO().to(chatRoomName(req.params.id)).emit('group_updated', chat);
  return sendSuccess(res, 200, chat, 'Members added');
});

// DELETE /api/chats/:id/members/:userId
export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const chat = await removeGroupMember(req.params.id, req.user!.userId, req.params.userId);
  const removedSocketIds = getSocketIdsForUsers([req.params.userId]);
  if (removedSocketIds.length > 0) {
    getIO().in(removedSocketIds).socketsLeave(chatRoomName(req.params.id));
  }
  getIO().to(chatRoomName(req.params.id)).emit('group_updated', chat);
  return sendSuccess(res, 200, chat, 'Member removed');
});

// POST /api/chats/:id/leave
export const leaveGroupChat = asyncHandler(async (req: Request, res: Response) => {
  await leaveGroup(req.params.id, req.user!.userId);
  getIO().to(chatRoomName(req.params.id)).emit('group_updated', { id: req.params.id });
  const ownSocketIds = getSocketIdsForUsers([req.user!.userId]);
  if (ownSocketIds.length > 0) {
    getIO().in(ownSocketIds).socketsLeave(chatRoomName(req.params.id));
  }
  return sendSuccess(res, 200, null, 'Left group');
});

// DELETE /api/chats/:id — hides the chat from the caller's list only (see
// deleteChatForUser); the other member(s) and the message history are unaffected.
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  await deleteChatForUser(req.params.id, req.user!.userId);
  return sendSuccess(res, 200, null, 'Chat deleted');
});

// GET /api/chats
export const listChats = asyncHandler(async (req: Request, res: Response) => {
  const chats = await listChatsForUser(req.user!.userId);
  return sendSuccess(res, 200, chats);
});

// GET /api/chats/:id
export const getChat = asyncHandler(async (req: Request, res: Response) => {
  const chat = await getChatForUser(req.params.id, req.user!.userId);
  return sendSuccess(res, 200, chat);
});

// GET /api/chat/:id/messages
export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit } = req.query as { cursor?: string; limit?: string };
  const result = await getMessages(req.params.id, req.user!.userId, {
    cursor,
    limit: limit ? Number(limit) : undefined,
  });
  return sendSuccess(res, 200, result);
});

// GET /api/chat/:id/messages/search?q=
export const searchChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim();
  if (!query) {
    throw ApiError.badRequest('Query parameter "q" is required');
  }
  const results = await searchMessagesInChat(req.params.id, req.user!.userId, query);
  return sendSuccess(res, 200, results);
});

// GET /api/chat/:id/messages/around/:messageId
export const getMessagesAroundHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMessagesAround(req.params.id, req.user!.userId, req.params.messageId);
  return sendSuccess(res, 200, result);
});
