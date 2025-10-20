import OpenAI from 'openai';
import config from '../../config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIResponse {
  content: string;
  usage?:
    | {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      }
    | undefined;
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateResponse(messages: ChatMessage[]): Promise<OpenAIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      return {
        content: response,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      console.error('OpenAI generateResponse error:', error);

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key is invalid or missing');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('OpenAI API rate limit exceeded');
        }
        if (error.message.includes('quota')) {
          throw new Error('OpenAI API quota exceeded');
        }
      }

      throw new Error('Failed to generate AI response');
    }
  }

  async generateResponseWithContext(
    userMessage: string,
    chatHistory: ChatMessage[] = []
  ): Promise<OpenAIResponse> {
    const systemMessage: ChatMessage = {
      role: 'system',
      content:
        'You are a helpful AI assistant. Respond to user messages in a friendly and helpful manner. Keep responses concise but informative.',
    };

    const messages: ChatMessage[] = [
      systemMessage,
      ...chatHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    return this.generateResponse(messages);
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
