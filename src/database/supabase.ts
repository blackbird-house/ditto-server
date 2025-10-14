import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseDatabase {
  private supabase: SupabaseClient | null = null;
  private initialized: boolean = false;

  constructor(url: string, anonKey: string) {
    // Skip initialization in test environment
    if (process.env['NODE_ENV'] === 'test') {
      console.log('⚠️  Supabase client initialization skipped in test environment');
      this.initialized = true;
      return;
    }

    // Create client with test-friendly configuration
    const clientOptions: any = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    };

    this.supabase = createClient(url, anonKey, clientOptions);
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Skip connection test in test environment
      if (process.env['NODE_ENV'] === 'test') {
        console.log('⚠️  Supabase connection test skipped in test environment');
        this.initialized = true;
        return;
      }
      
      // Check if tables exist by trying to query them
      // If they don't exist, we'll get an error which is expected
      // In a real production setup, you'd typically run migrations separately
      
      // Test connection by querying a simple table
      const { error } = await this.supabase!!
        .from('users')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist - this is expected for new setups
        console.log('⚠️  Supabase tables not found. Please run migrations to create tables.');
      } else if (error) {
        console.error('❌ Error connecting to Supabase:', error);
        throw error;
      } else {
        console.log('✅ Connected to Supabase successfully');
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Error initializing Supabase connection:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeTables();
    }
    
    // In test environment, throw an error if methods are called
    if (process.env['NODE_ENV'] === 'test' || !this.supabase) {
      throw new Error('Supabase methods should not be called in test environment - use SQLite instead');
    }
  }

  // User operations
  async createUser(userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('users')
      .insert([{
        id: userData.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUserById(id: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }

  async getUserByEmail(email: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }

  async getUserByPhone(phone: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user by phone: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }

  async updateUser(id: string, updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>): Promise<any> {
    await this.ensureInitialized();
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.firstName) updateData.first_name = updates.firstName;
    if (updates.lastName) updateData.last_name = updates.lastName;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;

    const { data, error } = await this.supabase!
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }

  // OTP operations
  async createOtpSession(sessionData: {
    id: string;
    phone: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('otp_sessions')
      .insert([{
        id: sessionData.id,
        phone: sessionData.phone,
        otp: sessionData.otp,
        expires_at: sessionData.expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }]);

    if (error) {
      throw new Error(`Failed to create OTP session: ${error.message}`);
    }
  }

  async getOtpSession(phone: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('otp_sessions')
      .select('*')
      .eq('phone', phone)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get OTP session: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        phone: data.phone,
        otp: data.otp,
        expiresAt: data.expires_at,
        createdAt: data.created_at
      };
    }

    return null;
  }

  async deleteOtpSession(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('otp_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete OTP session: ${error.message}`);
    }
  }

  async cleanupExpiredOtpSessions(): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('otp_sessions')
      .delete()
      .lte('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to cleanup expired OTP sessions: ${error.message}`);
    }
  }

  // Chat operations
  async createChat(chatData: {
    id: string;
    user1Id: string;
    user2Id: string;
  }): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('chats')
      .insert([{
        id: chatData.id,
        user1_id: chatData.user1Id,
        user2_id: chatData.user2Id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }
  }

  async getChatById(id: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get chat: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        user1Id: data.user1_id,
        user2Id: data.user2_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }

  async getChatByParticipants(user1Id: string, user2Id: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('chats')
      .select('*')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get chat by participants: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        user1Id: data.user1_id,
        user2Id: data.user2_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }

  async getUserChats(userId: string): Promise<any[]> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('chats')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user chats: ${error.message}`);
    }

    return data?.map(chat => ({
      id: chat.id,
      user1Id: chat.user1_id,
      user2Id: chat.user2_id,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
      otherUserId: chat.user1_id === userId ? chat.user2_id : chat.user1_id
    })) || [];
  }

  async updateChatUpdatedAt(chatId: string): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    if (error) {
      throw new Error(`Failed to update chat: ${error.message}`);
    }
  }

  // Message operations
  async createMessage(messageData: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<void> {
    await this.ensureInitialized();
    
    const { error } = await this.supabase!
      .from('chat_messages')
      .insert([{
        id: messageData.id,
        chat_id: messageData.chatId,
        sender_id: messageData.senderId,
        content: messageData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }

  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get chat messages: ${error.message}`);
    }

    return data?.map(message => ({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      updatedAt: message.updated_at
    })) || [];
  }

  async getMessagesBefore(chatId: string, beforeMessageId: string, limit: number = 20): Promise<any[]> {
    await this.ensureInitialized();
    
    // First, get the timestamp of the message we want to get messages before
    const { data: beforeMessage, error: beforeError } = await this.supabase!
      .from('chat_messages')
      .select('created_at')
      .eq('id', beforeMessageId)
      .eq('chat_id', chatId)
      .single();

    if (beforeError || !beforeMessage) {
      throw new Error(`Failed to find message with ID ${beforeMessageId}`);
    }

    // Then get messages older than that timestamp
    const { data, error } = await this.supabase!
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .lt('created_at', beforeMessage.created_at)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get messages before ${beforeMessageId}: ${error.message}`);
    }

    return data?.map(message => ({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      updatedAt: message.updated_at
    })) || [];
  }

  async getLastMessage(chatId: string): Promise<any> {
    await this.ensureInitialized();
    
    const { data, error } = await this.supabase!
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get last message: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        chatId: data.chat_id,
        senderId: data.sender_id,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    return null;
  }
}

// Singleton instance
let supabaseInstance: SupabaseDatabase | null = null;

export const getSupabaseDatabase = (url: string, anonKey: string): SupabaseDatabase => {
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseDatabase(url, anonKey);
  }
  return supabaseInstance;
};

// Function to reset singleton (useful for testing)
export const resetSupabaseDatabase = (): void => {
  supabaseInstance = null;
};
