import {
  Chat,
  Message,
  ChatService,
  ChatWithMessages,
  ChatListResponse,
} from './types';
import { randomUUID } from 'crypto';
import { databaseService } from '../../database';
import { userService } from '../users/service';
import { openaiService, ChatMessage } from './openaiService';

class DatabaseChatService implements ChatService {
  async createChat(userId: string, otherUserId: string): Promise<Chat> {
    // Validate that both users exist
    const user = await userService.getUserById(userId);
    const otherUser = await userService.getUserById(otherUserId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!otherUser) {
      throw new Error('User not found');
    }

    // Check if chat already exists between these users
    const existingChat = await databaseService.getChatByParticipants(
      userId,
      otherUserId
    );
    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chatId = randomUUID();
    const chat: Chat = {
      id: chatId,
      user1Id: userId,
      user2Id: otherUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await databaseService.createChat(chat);
    return chat;
  }

  async getUserChats(userId: string): Promise<ChatListResponse[]> {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const chats = await databaseService.getUserChats(userId);
    const chatList: ChatListResponse[] = [];

    for (const chat of chats) {
      // Get the other user's info
      const otherUserId = chat.otherUserId;
      const otherUser = await userService.getUserById(otherUserId);

      if (!otherUser) {
        continue; // Skip if other user doesn't exist
      }

      // Get last message for this chat
      const lastMessage = await databaseService.getLastMessage(chat.id);

      const chatResponse: ChatListResponse = {
        id: chat.id,
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
        },
        ...(lastMessage && {
          lastMessage: {
            id: lastMessage.id,
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: new Date(lastMessage.createdAt),
          },
        }),
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
      };

      chatList.push(chatResponse);
    }

    return chatList;
  }

  async getChatById(
    userId: string,
    chatId: string
  ): Promise<ChatWithMessages | null> {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const chat = await databaseService.getChatById(chatId);
    if (!chat) {
      return null;
    }

    // Privacy check: user must be a user in this chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('Access denied: You can only view your own chats');
    }

    // Get the other user's info
    const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
    const otherUser = await userService.getUserById(otherUserId);

    if (!otherUser) {
      throw new Error('Other user not found');
    }

    // Get all messages for this chat
    const messages = await databaseService.getMessages(chatId);
    const formattedMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      chatId: msg.chatId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt),
    }));

    return {
      id: chat.id,
      user1Id: chat.user1Id,
      user2Id: chat.user2Id,
      otherUser: {
        id: otherUser.id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
      },
      messages: formattedMessages,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    };
  }

  async sendMessage(
    userId: string,
    chatId: string,
    content: string
  ): Promise<Message> {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate chat exists and user is a participant
    const chat = await databaseService.getChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Privacy check: user must be a user in this chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error(
        'Access denied: You can only send messages to your own chats'
      );
    }

    // Validate message content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 1000) {
      throw new Error('Message content cannot exceed 1000 characters');
    }

    // Create message
    const messageId = randomUUID();
    const message: Message = {
      id: messageId,
      chatId: chatId,
      senderId: userId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await databaseService.createMessage(message);

    // Update chat's updatedAt timestamp
    await databaseService.updateChatUpdatedAt(chatId);

    return message;
  }

  async getChatMessages(
    userId: string,
    chatId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Message[]> {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate chat exists and user is a participant
    const chat = await databaseService.getChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Privacy check: user must be a user in this chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error(
        'Access denied: You can only view messages from your own chats'
      );
    }

    // Validate pagination parameters
    if (limit < 1 || limit > 20) {
      throw new Error('Invalid limit: must be between 1 and 20');
    }
    if (offset < 0) {
      throw new Error('Invalid offset: must be 0 or greater');
    }

    const messages = await databaseService.getMessages(chatId, limit, offset);
    return messages.map(msg => ({
      id: msg.id,
      chatId: msg.chatId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt),
    }));
  }

  async getMessagesBefore(
    userId: string,
    chatId: string,
    beforeMessageId: string,
    limit: number = 20
  ): Promise<Message[]> {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate chat exists and user is a participant
    const chat = await databaseService.getChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Privacy check: user must be a user in this chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error(
        'Access denied: You can only view messages from your own chats'
      );
    }

    // Validate pagination parameters
    if (limit < 1 || limit > 50) {
      throw new Error('Invalid limit: must be between 1 and 50');
    }

    // Validate that the beforeMessageId exists in this chat
    const beforeMessage = await databaseService.getMessages(chatId, 1, 0);
    const messageExists = beforeMessage.some(msg => msg.id === beforeMessageId);
    if (!messageExists) {
      // Check if the message exists at all by trying to get messages before it
      try {
        await databaseService.getMessagesBefore(chatId, beforeMessageId, 1);
      } catch (error) {
        throw new Error('Message not found');
      }
    }

    const messages = await databaseService.getMessagesBefore(
      chatId,
      beforeMessageId,
      limit
    );
    return messages.map(msg => ({
      id: msg.id,
      chatId: msg.chatId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt),
    }));
  }

  async sendAIMessage(
    userId: string,
    content: string
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate message content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 1000) {
      throw new Error('Message content cannot exceed 1000 characters');
    }

    // Create or get AI chat (using a special AI user ID)
    const aiUserId = 'ai-assistant';
    let chat = await databaseService.getChatByParticipants(userId, aiUserId);

    if (!chat) {
      // Create new AI chat
      const chatId = randomUUID();
      chat = {
        id: chatId,
        user1Id: userId,
        user2Id: aiUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await databaseService.createChat(chat);
    }

    // Save user message
    const userMessageId = randomUUID();
    const userMessage: Message = {
      id: userMessageId,
      chatId: chat.id,
      senderId: userId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await databaseService.createMessage(userMessage);

    // Get recent chat history for context (last 10 messages, excluding the one we just saved)
    const recentMessages = await databaseService.getMessages(chat.id, 10, 0);
    const chatHistory: ChatMessage[] = recentMessages.map(msg => ({
      role: msg.senderId === userId ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Add the current user message to the chat history for AI context
    chatHistory.push({
      role: 'user',
      content: content.trim(),
    });

    // Generate AI response
    const aiResponse = await openaiService.generateResponseWithContext(
      content.trim(),
      chatHistory
    );

    // Save AI response as a message
    const aiMessageId = randomUUID();
    const aiMessage: Message = {
      id: aiMessageId,
      chatId: chat.id,
      senderId: aiUserId,
      content: aiResponse.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await databaseService.createMessage(aiMessage);

    // Update chat's updatedAt timestamp
    await databaseService.updateChatUpdatedAt(chat.id);

    return { userMessage, aiMessage };
  }
}

// Export singleton instance
export const chatService = new DatabaseChatService();
