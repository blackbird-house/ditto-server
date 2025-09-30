export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatRequest {
  userId: string; // The other user to chat with
}

export interface CreateChatResponse {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatWithMessages {
  id: string;
  user1Id: string;
  user2Id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatListResponse {
  id: string;
  user1Id: string;
  user2Id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatService {
  createChat(userId: string, otherUserId: string): Promise<Chat>;
  getUserChats(userId: string): Promise<ChatListResponse[]>;
  getChatById(userId: string, chatId: string): Promise<ChatWithMessages | null>;
  sendMessage(userId: string, chatId: string, content: string): Promise<Message>;
  getChatMessages(userId: string, chatId: string, limit?: number, offset?: number): Promise<Message[]>;
}
