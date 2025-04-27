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
 * @exports QuestionnaireData - The type for questionnaire data.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define schema for optional questionnaire data
const QuestionnaireDataSchema = z.object({
  age: z.number().optional().describe('User\'s age.'),
  gender: z.string().optional().describe('User\'s gender.'),
  complexion: z.string().optional().describe('User\'s skin complexion.'),
  products: z.string().optional().describe('Skincare products currently used by the user.'),
  symptoms: z.string().optional().describe('Primary symptoms reported by the user.'),
}).optional();
// Export the type, but not the schema object itself
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
      - Actinic Keratosis (AKIEC): Rough, scaly patch on sun-exposed skin, pre-cancerous.
      - Basal Cell Carcinoma (BCC): Pearly or waxy bump, or a flat flesh-colored or brown scar-like lesion.
      - Benign Keratosis-like Lesions (BKL): Seborrheic keratoses, solar lentigines, etc. (non-cancerous growths).
      - Dermatofibroma (DF): Small, firm bump in the skin, often on lower legs.
      - Melanoma (MEL): Serious skin cancer; look for ABCDE rules (Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving).
      - Melanocytic Nevi (NV): Common moles (benign).
      - Vascular Lesions (VASC): Cherry angiomas, spider angiomas, pyogenic granulomas (related to blood vessels).

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
      1.  'predictedDisease': The single most likely disease/condition name from the list above (AKIEC, BCC, BKL, DF, MEL, NV, VASC) or 'Unknown/Benign' if no specific condition is detected or identifiable. Use the abbreviations provided (e.g., AKIEC, MEL, NV).
      2.  'confidencePercentage': Your confidence level (0-100) for this specific prediction. Be realistic; confidence might be lower for subtle cases or poor image quality.
      3.  'notes' (optional): Briefly mention key visual features supporting your prediction or any uncertainties. If suggesting 'MEL', 'BCC', or 'AKIEC', strongly emphasize consulting a dermatologist immediately. For 'NV' or 'BKL', mention they are typically benign but monitoring changes is good practice.
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
