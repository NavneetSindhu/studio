
'use server';

/**
 * @fileOverview Defines a Genkit flow for handling chatbot interactions.
 * This flow uses the Gemini API to generate responses based on the user's message and conversation history.
 *
 * @exports chatWithBot - The main function to interact with the chatbot flow.
 * @exports ChatInput - The input type for the chatWithBot function.
 * @exports ChatOutput - The output type for the chatWithBot function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {generate} from 'genkit/generate'; // Import generate function
import {defineFlow, type Flow} from 'genkit'; // Import defineFlow and Flow type

// Define schema for a single message in the history
const MessageSchema = z.object({
  text: z.string(),
  sender: z.enum(['user', 'bot']),
});

// Define the input schema for the chat flow
const ChatInputSchema = z.object({
  message: z.string().describe('The latest message from the user.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Define the output schema for the chat flow
const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s generated response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Define the async wrapper function which calls the flow
export async function chatWithBot(input: ChatInput): Promise<ChatOutput> {
  // Ensure the flow is defined before calling it
  if (!chatFlow) {
    throw new Error("Chat flow is not defined yet.");
  }
  return chatFlow(input);
}

// Define the Genkit flow for the chatbot using defineFlow directly
const chatFlow: Flow<typeof ChatInputSchema, typeof ChatOutputSchema> = defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    console.log('Chat Flow Input:', { message: input.message, historyLength: input.history?.length });

    // Construct the prompt history from the input history
    const history = input.history?.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model', // Map sender to Genkit role
        content: [{ text: msg.text }],
    })) || [];


    // Construct the prompt with history and the new message
    const prompt = [
        // Optional system prompt or initial instructions
        { role: 'system', content: [{ text: 'You are a helpful AI assistant for SkinSeva, a skin disease analysis app. Answer user questions concisely and helpfully. Do not provide medical diagnoses. If asked about specific medical conditions, advise the user to consult a dermatologist.' }] },
        ...history, // Include past conversation
        { role: 'user', content: [{ text: input.message }] }, // Add the latest user message
      ];


    try {
        const llmResponse = await generate({
            model: ai.model, // Use the default model configured in ai-instance
            prompt: prompt,
             // Optional configuration for the model
             config: {
                 temperature: 0.7, // Adjust creativity vs. factuality
                 // maxOutputTokens: 150, // Limit response length if needed
             },
             output: {
                 format: 'text', // Expect plain text output
             },
        });

        const responseText = llmResponse.text();
        console.log('Chat Flow LLM Response:', responseText);


        if (!responseText) {
            console.error('Chat Flow: LLM returned empty response.');
            return { response: "Sorry, I couldn't generate a response right now." };
        }

        return { response: responseText };

    } catch (error) {
      console.error('Error during Gemini API call in chatFlow:', error);
      // Provide a more generic error message to the user
      return { response: 'Sorry, there was an error connecting to the AI assistant. Please try again later.' };
    }
  }
);

// Register the flow with Genkit using ai.defineFlow for potential discovery/tooling
// Note: This creates a managed flow object, but we are using the 'chatFlow' function directly above.
ai.defineFlow(
   {
     name: 'managedChatFlow', // Different name to avoid conflict if needed
     inputSchema: ChatInputSchema,
     outputSchema: ChatOutputSchema,
   },
   chatFlow // Pass the flow implementation function
);

    