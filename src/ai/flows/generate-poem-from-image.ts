// This file is machine-generated - edit at your own risk!

'use server';
/**
 * @fileOverview Generates a short Hindi shayari based on the content and mood of an image, written in Roman script.
 *
 * - generatePoemFromImage - A function that handles the shayari generation process.
 * - GeneratePoemFromImageInput - The input type for the generatePoemFromImage function.
 * - GenerateShayariFromImageOutput - The return type for the generatePoemFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePoemFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to inspire the poem, as a data URI that must include a MIME type (image/jpeg, image/png, image/webp, image/gif) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePoemFromImageInput = z.infer<typeof GeneratePoemFromImageInputSchema>;

const GenerateShayariFromImageOutputSchema = z.object({
  title: z.string().describe('The title of the shayari (English or Hinglish).'),
  shayari: z.string().describe('The generated short Hindi shayari (max 6 lines) written in Roman script (e.g., "Yeh shaam mastani...") based on the image.'),
});
export type GenerateShayariFromImageOutput = z.infer<typeof GenerateShayariFromImageOutputSchema>;


// The functionality changes, but the "interface" to the frontend remains similar.
export async function generatePoemFromImage(input: GeneratePoemFromImageInput): Promise<GenerateShayariFromImageOutput> {
  return generateShayariFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShayariFromImagePrompt', // Renamed prompt
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo to inspire the shayari, as a data URI that must include a MIME type (image/jpeg, image/png, image/webp, image/gif) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: GenerateShayariFromImageOutputSchema, // Use the updated output schema
  },
  prompt: `You are a skilled shayar (Hindi poet). Analyze the image provided and write a short shayari in Hindi (maximum 6 lines) that captures its essence, themes, and emotions.

**IMPORTANT:** Write the shayari text using the Roman alphabet (English letters), not Devanagari script. For example, write "Dil ki baat" instead of "दिल की बात". The shayari should have a title (in English or Hinglish).

Image: {{media url=photoDataUri}}

Respond with a title and the shayari. Ensure the shayari text itself is in Romanized Hindi and does not exceed 6 lines.
`,
});

const generateShayariFromImageFlow = ai.defineFlow<
  typeof GeneratePoemFromImageInputSchema,
  typeof GenerateShayariFromImageOutputSchema // Use updated output schema here
>(
  {
    name: 'generateShayariFromImageFlow', // Renamed flow
    inputSchema: GeneratePoemFromImageInputSchema,
    outputSchema: GenerateShayariFromImageOutputSchema, // Use updated output schema here
  },
  async input => {
    const {output} = await prompt(input);
    // Add extra validation/check if needed, e.g., line count, although trusting the LLM for now.
    return output!;
  }
);
