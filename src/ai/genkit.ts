import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This configuration explicitly tells Genkit to use the Google AI API key
// from the environment variables.
// Please ensure GOOGLE_API_KEY or GEMINI_API_KEY is set in your environment.
export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY}),
  ],
});
