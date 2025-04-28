'use server';

import { ai } from '@/ai/ai-instance';  // Make sure ai is correctly initialized
import { z } from 'genkit';
import { defineFlow, type Flow } from 'genkit';  // Removed unused import for generate

const MessageSchema = z.object({
  text: z.string(),
  sender: z.enum(['user', 'bot']),
});

const ChatInputSchema = z.object({
  message: z.string().describe('The latest message from the user.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s generated response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithBot(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow: Flow<typeof ChatInputSchema, typeof ChatOutputSchema> = defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    console.log('Chat Flow Input:', { message: input.message, historyLength: input.history?.length });

    const history = input.history?.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model', 
      content: [{ text: msg.text }],
    })) || [];

    const prompt = [
      { role: 'system', content: [{ text: 'You are a helpful AI assistant for SkinSeva, a skin disease analysis app. Answer user questions concisely and helpfully. Do not provide medical diagnoses.' }] },
      ...history,
      { role: 'user', content: [{ text: input.message }] },
    ];

    try {
      // Ensure 'ai.generate' is being used here
      const llmResponse = await ai.generate({
        prompt: prompt,
        config: {
          temperature: 0.7,
        },
        output: {
          format: 'text',
        },
      });

      const responseText = llmResponse.text();  // Retrieve the text response from the generated output

      console.log('Chat Flow LLM Response:', responseText);

      if (!responseText) {
        console.error('Chat Flow: LLM returned empty response.');
        return { response: "Sorry, I couldn't generate a response right now." };
      }

      return { response: responseText };

    } catch (error) {
      console.error('Error during Gemini API call in chatFlow:', error);
      return { response: 'Sorry, there was an error connecting to the AI assistant. Please try again later.' };
    }
  }
);

// Register the flow in ai
ai.defineFlow(
  {
    name: 'managedChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  chatFlow
);
