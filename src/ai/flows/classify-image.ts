'use server';

/**
 * @fileOverview This file defines a Genkit flow for classifying face images to predict potential skin diseases,
 * optionally using questionnaire data for context.
 *
 * The flow takes an image and optional questionnaire data as input and uses a Genkit prompt
 * to predict the disease, returning the predicted disease name along with a confidence percentage.
 *
 * @exports classifyImage - The main function to classify the image and return the disease prediction.
 * @exports ClassifyImageInput - The input type for the classifyImage function.
 * @exports ClassifyImageOutput - The output type for the classifyImage function.
 * @exports QuestionnaireDataSchema - The Zod schema for questionnaire data.
 * @exports QuestionnaireData - The type for questionnaire data.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define schema for optional questionnaire data
export const QuestionnaireDataSchema = z.object({
  age: z.number().optional().describe('User\'s age.'),
  gender: z.string().optional().describe('User\'s gender.'),
  complexion: z.string().optional().describe('User\'s skin complexion.'),
  products: z.string().optional().describe('Skincare products currently used by the user.'),
  symptoms: z.string().optional().describe('Primary symptoms reported by the user.'),
}).optional();
export type QuestionnaireData = z.infer<typeof QuestionnaireDataSchema>;


const ClassifyImageInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "A face image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  questionnaireData: QuestionnaireDataSchema.describe('Optional questionnaire data provided by the user.'),
});
export type ClassifyImageInput = z.infer<typeof ClassifyImageInputSchema>;

const ClassifyImageOutputSchema = z.object({
  predictedDisease: z.string().describe('The predicted disease name.'),
  confidencePercentage: z.number().describe('The confidence percentage of the prediction (0-100).'),
   // Adding more details for potential future use
  possibleDiseases: z.array(z.object({
      name: z.string(),
      confidence: z.number(),
  })).optional().describe('List of possible diseases with confidence scores if available.'),
  notes: z.string().optional().describe('Additional notes or observations from the AI.')
});
export type ClassifyImageOutput = z.infer<typeof ClassifyImageOutputSchema>;

export async function classifyImage(input: ClassifyImageInput): Promise<ClassifyImageOutput> {
  return classifyImageFlow(input);
}

const classifyImagePrompt = ai.definePrompt({
  name: 'classifyImagePrompt',
  input: {
    schema: ClassifyImageInputSchema, // Use the updated schema
  },
  output: {
    schema: ClassifyImageOutputSchema, // Use the updated output schema
  },
  // Updated prompt to incorporate questionnaire data if available
  prompt: `Analyze the given face image and predict the most likely skin disease. Consider the provided user information if available.
      Based on the HAM10000 dataset and common facial conditions, the possible skin diseases include (but are not limited to):
      - Acne Vulgaris (common acne, pimples, blackheads)
      - Eczema / Atopic Dermatitis (itchy, red, inflamed patches)
      - Psoriasis (red, flaky patches with silvery scales)
      - Vitiligo (loss of skin color in patches)
      - Melanoma / Suspicious Mole (a type of skin cancer, check ABCDE rules)
      - Rosacea (facial redness, flushing, visible blood vessels)
      - Seborrheic Dermatitis (flaky, yellowish scales on oily areas)
      - Actinic Keratosis (rough, scaly patch on sun-exposed skin, pre-cancerous)

      User Provided Information (if any):
      {{#if questionnaireData}}
      Age: {{questionnaireData.age}}
      Gender: {{questionnaireData.gender}}
      Complexion: {{questionnaireData.complexion}}
      Reported Symptoms: {{questionnaireData.symptoms}}
      Current Products: {{questionnaireData.products}}
      {{else}}
      No questionnaire data provided. Rely primarily on image analysis.
      {{/if}}

      Analyze the image carefully: {{media url=imageUri}}

      Based on the visual evidence and any provided context, return:
      1.  'predictedDisease': The single most likely disease name from the list above or 'Unknown/Benign' if no disease is detected or identifiable.
      2.  'confidencePercentage': Your confidence level (0-100) for this specific prediction. Be realistic; confidence might be lower for subtle cases or poor image quality.
      3.  'notes' (optional): Briefly mention key visual features supporting your prediction or any uncertainties. If suggesting 'Melanoma' or 'Actinic Keratosis', strongly emphasize consulting a dermatologist immediately.
      `,
});

const classifyImageFlow = ai.defineFlow<
  typeof ClassifyImageInputSchema,
  typeof ClassifyImageOutputSchema
>({
  name: 'classifyImageFlow',
  inputSchema: ClassifyImageInputSchema,
  outputSchema: ClassifyImageOutputSchema,
}, async input => {
  console.log("Flow Input:", input); // Log input to check questionnaire data
  const {output} = await classifyImagePrompt(input);

  // Basic validation/fallback for output
  if (!output) {
      throw new Error("AI analysis did not return a valid output.");
  }
   if (!output.predictedDisease) {
       output.predictedDisease = "Analysis Inconclusive";
   }
   if (typeof output.confidencePercentage !== 'number' || output.confidencePercentage < 0 || output.confidencePercentage > 100) {
       output.confidencePercentage = 0; // Default confidence if invalid
   }

  console.log("Flow Output:", output);
  return output;
});

