// This file uses server-side code.
'use server';

/**
 * @fileOverview AI agent to moderate user-submitted takes for hate speech and negativity.
 *
 * - moderateTake - A function that moderates the take.
 * - ModerateTakeInput - The input type for the moderateTake function.
 * - ModerateTakeOutput - The return type for the moderateTake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTakeInputSchema = z.object({
  text: z.string().describe('The text content of the user take.'),
});
export type ModerateTakeInput = z.infer<typeof ModerateTakeInputSchema>;

const ModerateTakeOutputSchema = z.object({
  flagForReview: z
    .boolean()
    .describe(
      'Whether the take should be flagged for review due to hate speech or negativity.'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason why the take was flagged, if applicable.'),
});
export type ModerateTakeOutput = z.infer<typeof ModerateTakeOutputSchema>;

export async function moderateTake(input: ModerateTakeInput): Promise<ModerateTakeOutput> {
  return moderateTakeFlow(input);
}

const moderateTakePrompt = ai.definePrompt({
  name: 'moderateTakePrompt',
  input: {schema: ModerateTakeInputSchema},
  output: {schema: ModerateTakeOutputSchema},
  prompt: `You are an AI content moderator responsible for reviewing user-submitted takes and flagging those that contain hate speech, negativity, or violate community guidelines.

  Analyze the following take and determine if it should be flagged for review.
  Consider factors such as the presence of offensive language, discriminatory statements, or overly negative sentiment.

  Take: {{{text}}}

  Return a JSON object indicating whether the take should be flagged and, if so, the reason for flagging it.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const moderateTakeFlow = ai.defineFlow(
  {name: 'moderateTakeFlow', inputSchema: ModerateTakeInputSchema, outputSchema: ModerateTakeOutputSchema},
  async input => {
    const {output} = await moderateTakePrompt(input);
    return output!;
  }
);
