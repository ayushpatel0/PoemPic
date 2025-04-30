// This file is machine-generated - edit at your own risk!

'use server';
/**
 * @fileOverview Generates a poem based on the content and mood of an image.
 *
 * - generatePoemFromImage - A function that handles the poem generation process.
 * - GeneratePoemFromImageInput - The input type for the generatePoemFromImage function.
 * - GeneratePoemFromImageOutput - The return type for the generatePoemFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePoemFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePoemFromImageInput = z.infer<typeof GeneratePoemFromImageInputSchema>;

const GeneratePoemFromImageOutputSchema = z.object({
  title: z.string().describe('The title of the poem.'),
  poem: z.string().describe('The generated poem based on the image.'),
});
export type GeneratePoemFromImageOutput = z.infer<typeof GeneratePoemFromImageOutputSchema>;

export async function generatePoemFromImage(input: GeneratePoemFromImageInput): Promise<GeneratePoemFromImageOutput> {
  return generatePoemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromImagePrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      title: z.string().describe('The title of the poem.'),
      poem: z.string().describe('The generated poem based on the image.'),
    }),
  },
  prompt: `You are a poet laureate, skilled in crafting evocative poems. Analyze the image provided and write a poem that captures its essence, themes, and emotions. The poem should have a title.

Image: {{media url=photoDataUri}}

Respond with a title and poem.
`,
});

const generatePoemFromImageFlow = ai.defineFlow<
  typeof GeneratePoemFromImageInputSchema,
  typeof GeneratePoemFromImageOutputSchema
>(
  {
    name: 'generatePoemFromImageFlow',
    inputSchema: GeneratePoemFromImageInputSchema,
    outputSchema: GeneratePoemFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
