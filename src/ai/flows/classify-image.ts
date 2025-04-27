'use server';

/**
 * @fileOverview This file defines a Genkit flow for classifying face images to predict potential skin diseases.
 *
 * The flow takes an image as input and uses a Genkit prompt to predict the disease,
 * and returns the predicted disease name along with a confidence percentage.
 *
 * @exports classifyImage - The main function to classify the image and return the disease prediction.
 * @exports ClassifyImageInput - The input type for the classifyImage function.
 * @exports ClassifyImageOutput - The output type for the classifyImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ClassifyImageInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "A face image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyImageInput = z.infer<typeof ClassifyImageInputSchema>;

const ClassifyImageOutputSchema = z.object({
  predictedDisease: z.string().describe('The predicted disease name.'),
  confidencePercentage: z.number().describe('The confidence percentage of the prediction.'),
});
export type ClassifyImageOutput = z.infer<typeof ClassifyImageOutputSchema>;

export async function classifyImage(input: ClassifyImageInput): Promise<ClassifyImageOutput> {
  return classifyImageFlow(input);
}

const classifyImagePrompt = ai.definePrompt({
  name: 'classifyImagePrompt',
  input: {
    schema: z.object({
      imageUri: z
        .string()
        .describe(
          "A face image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      predictedDisease: z.string().describe('The predicted disease name.'),
      confidencePercentage: z.number().describe('The confidence percentage of the prediction.'),
    }),
  },
  prompt: `Analyze the given face image and predict the skin disease.
      Based on the HAM10000 dataset, the possible skin diseases are:
      - Acne (pimples or blackheads)
      - Psoriasis (red, flaky, and sometimes scaly patches)
      - Vitiligo (loss of skin color in patches)
      - Melanoma (a type of skin cancer, usually dark or irregular moles)

      Return the predicted disease name and the confidence percentage of your prediction.

      Return the predicted disease name and the confidence percentage of your prediction.

      Here is the face image: {{media url=imageUri}}
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
  const {output} = await classifyImagePrompt(input);
  return output!;
});
