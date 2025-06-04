
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

const plugins = [];

if (apiKey) {
  plugins.push(googleAI({apiKey}));
} else {
  console.warn(
    "WARNING: GOOGLE_API_KEY or GEMINI_API_KEY is not set in environment variables. " +
    "Attempting to initialize Google AI plugin without an explicit API key. " +
    "This may rely on Application Default Credentials (ADC) if available, " +
    "or could lead to errors if authentication fails."
  );
  // Initialize googleAI without the apiKey parameter to allow fallback to ADC or other auth methods.
  // This also prevents passing `apiKey: undefined` which some plugins might treat as an invalid argument.
  plugins.push(googleAI());
}

// This configuration explicitly tells Genkit to use the Google AI API key
// from the environment variables if provided.
// Please ensure GOOGLE_API_KEY or GEMINI_API_KEY is set in your environment,
// or that Application Default Credentials (ADC) are configured if no key is provided.
export const ai = genkit({
  plugins: plugins,
});
