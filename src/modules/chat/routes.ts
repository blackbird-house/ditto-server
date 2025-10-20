import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  createChat,
  getUserChats,
  getChatById,
  sendMessage,
  getChatMessages,
  sendAIMessage,
} from './controller';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// AI Chat routes - MUST be before parameterized routes
router.post('/ai/messages', sendAIMessage);

// Chat management routes
router.post('/', createChat);
router.get('/', getUserChats);
router.get('/:chatId', getChatById);

// Message routes
router.post('/:chatId/messages', sendMessage);
router.get('/:chatId/messages', getChatMessages);

export default router;
