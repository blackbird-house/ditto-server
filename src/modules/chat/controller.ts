import { Request, Response } from 'express';
import { chatService } from './service';
import {
  CreateChatRequest,
  SendMessageRequest,
  SendAIMessageRequest,
} from './types';
import { logError } from '../../utils/logger';

export const createChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { userId: otherUserId }: CreateChatRequest = req.body;

    if (!otherUserId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    if (otherUserId === userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    const chat = await chatService.createChat(userId, otherUserId);

    res.status(201).json({
      id: chat.id,
      user1Id: chat.user1Id,
      user2Id: chat.user2Id,
      createdAt: chat.createdAt.toISOString(),
    });
  } catch (error) {
    logError('Chat', 'createChat', error, req);

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create chat',
    });
  }
};

export const getUserChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const chats = await chatService.getUserChats(userId);

    const response = chats.map(chat => ({
      id: chat.id,
      user1Id: chat.user1Id,
      user2Id: chat.user2Id,
      otherUser: chat.otherUser,
      lastMessage: chat.lastMessage
        ? {
            id: chat.lastMessage.id,
            content: chat.lastMessage.content,
            senderId: chat.lastMessage.senderId,
            createdAt: chat.lastMessage.createdAt.toISOString(),
          }
        : null,
      createdAt: chat.createdAt.toISOString(),
    }));

    res.status(200).json(response);
  } catch (error) {
    logError('Chat', 'getUserChats', error, req);

    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        error: 'Not Found',
        message: 'Resource not found',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve chats',
    });
  }
};

export const getChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { chatId } = req.params;

    if (!chatId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    const chat = await chatService.getChatById(userId, chatId);

    if (!chat) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Resource not found',
      });
      return;
    }

    const response = {
      id: chat.id,
      user1Id: chat.user1Id,
      user2Id: chat.user2Id,
      otherUser: chat.otherUser,
      messages: chat.messages.map(message => ({
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
      createdAt: chat.createdAt.toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logError('Chat', 'getChatById', error, req);

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found',
        });
        return;
      }

      if (error.message === 'Access denied: You can only view your own chats') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve chat',
    });
  }
};

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { chatId } = req.params;
    const { content }: SendMessageRequest = req.body;

    if (!chatId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    const message = await chatService.sendMessage(userId, chatId, content);

    res.status(201).json({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error) {
    logError('Chat', 'sendMessage', error, req);

    if (error instanceof Error) {
      if (
        error.message === 'User not found' ||
        error.message === 'Chat not found'
      ) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found',
        });
        return;
      }

      if (
        error.message ===
        'Access denied: You can only send messages to your own chats'
      ) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied',
        });
        return;
      }

      if (error.message.includes('Message content')) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send message',
    });
  }
};

export const getChatMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { chatId } = req.params;

    if (!chatId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    // Parse pagination parameters
    const limit = parseInt(req.query['limit'] as string) || 20;
    const offset = parseInt(req.query['offset'] as string) || 0;
    const beforeMessageId = req.query['before'] as string;

    let messages;
    if (beforeMessageId) {
      // Use cursor-based pagination with beforeMessageId
      messages = await chatService.getMessagesBefore(
        userId,
        chatId,
        beforeMessageId,
        limit
      );
    } else {
      // Use offset-based pagination (existing behavior)
      messages = await chatService.getChatMessages(
        userId,
        chatId,
        limit,
        offset
      );
    }

    const response = messages.map(message => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }));

    res.status(200).json(response);
  } catch (error) {
    logError('Chat', 'getChatMessages', error, req);

    if (error instanceof Error) {
      if (
        error.message === 'User not found' ||
        error.message === 'Chat not found' ||
        error.message === 'Message not found'
      ) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found',
        });
        return;
      }

      if (
        error.message ===
        'Access denied: You can only view messages from your own chats'
      ) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied',
        });
        return;
      }

      if (
        error.message.includes('Invalid limit') ||
        error.message.includes('Invalid offset')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve messages',
    });
  }
};

export const sendAIMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { content }: SendAIMessageRequest = req.body;

    if (!content) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
      });
      return;
    }

    const { userMessage, aiMessage } = await chatService.sendAIMessage(
      userId,
      content
    );

    res.status(201).json({
      userMessage: {
        id: userMessage.id,
        chatId: userMessage.chatId,
        senderId: userMessage.senderId,
        content: userMessage.content,
        createdAt: userMessage.createdAt.toISOString(),
      },
      aiMessage: {
        id: aiMessage.id,
        chatId: aiMessage.chatId,
        senderId: aiMessage.senderId,
        content: aiMessage.content,
        createdAt: aiMessage.createdAt.toISOString(),
      },
    });
  } catch (error) {
    logError('Chat', 'sendAIMessage', error, req);

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found',
        });
        return;
      }

      if (error.message.includes('Message content')) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request data',
        });
        return;
      }

      if (error.message.includes('OpenAI')) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'AI service is currently unavailable',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send AI message',
    });
  }
};
