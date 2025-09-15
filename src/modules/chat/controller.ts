import { Request, Response } from 'express';
import { chatService } from './service';
import { CreateChatRequest, SendMessageRequest } from './types';

export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const { participantId }: CreateChatRequest = req.body;

    if (!participantId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Participant ID is required'
      });
      return;
    }

    if (participantId === userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot create chat with yourself'
      });
      return;
    }

    const chat = await chatService.createChat(userId, participantId);

    res.status(201).json({
      message: 'Chat created successfully',
      chat: {
        id: chat.id,
        participant1Id: chat.participant1Id,
        participant2Id: chat.participant2Id,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString()
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found' || error.message === 'Participant not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create chat'
    });
  }
};

export const getUserChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const chats = await chatService.getUserChats(userId);

    const response = chats.map(chat => ({
      id: chat.id,
      participant1Id: chat.participant1Id,
      participant2Id: chat.participant2Id,
      otherParticipant: chat.otherParticipant,
      lastMessage: chat.lastMessage ? {
        id: chat.lastMessage.id,
        content: chat.lastMessage.content,
        senderId: chat.lastMessage.senderId,
        createdAt: chat.lastMessage.createdAt.toISOString()
      } : null,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    }));

    res.status(200).json({
      message: 'Chats retrieved successfully',
      chats: response
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve chats'
    });
  }
};

export const getChatById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const { chatId } = req.params;

    if (!chatId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Chat ID is required'
      });
      return;
    }

    const chat = await chatService.getChatById(userId, chatId);

    if (!chat) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Chat not found'
      });
      return;
    }

    const response = {
      id: chat.id,
      participant1Id: chat.participant1Id,
      participant2Id: chat.participant2Id,
      otherParticipant: chat.otherParticipant,
      messages: chat.messages.map(message => ({
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      })),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    };

    res.status(200).json({
      message: 'Chat retrieved successfully',
      chat: response
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }
      
      if (error.message === 'Access denied: You can only view your own chats') {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve chat'
    });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const { chatId } = req.params;
    const { content }: SendMessageRequest = req.body;

    if (!chatId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Chat ID is required'
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Message content is required'
      });
      return;
    }

    const message = await chatService.sendMessage(userId, chatId, content);

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found' || error.message === 'Chat not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }
      
      if (error.message === 'Access denied: You can only send messages to your own chats') {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
        return;
      }
      
      if (error.message.includes('Message content')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send message'
    });
  }
};

export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const { chatId } = req.params;

    if (!chatId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Chat ID is required'
      });
      return;
    }

    const messages = await chatService.getChatMessages(userId, chatId);

    const response = messages.map(message => ({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    }));

    res.status(200).json({
      message: 'Messages retrieved successfully',
      messages: response
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found' || error.message === 'Chat not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }
      
      if (error.message === 'Access denied: You can only view messages from your own chats') {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve messages'
    });
  }
};
