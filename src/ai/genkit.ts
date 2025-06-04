
import {genkit} from 'genkit';
import {googleAI, type GoogleAIOptions} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

const plugins = [];

// Define default options for the Google AI plugin
const defaultGoogleAIOptions: GoogleAIOptions = {
  defaultModelName: 'gemini-1.5-flash-latest', // Set your desired default text model here
};

if (apiKey) {
  plugins.push(googleAI({apiKey, ...defaultGoogleAIOptions}));
} else {
  console.warn(
    "WARNING: GOOGLE_API_KEY or GEMINI_API_KEY is not set in environment variables. " +
    "Attempting to initialize Google AI plugin without an explicit API key. " +
    "This may rely on Application Default Credentials (ADC) if available, " +
    "or could lead to errors if authentication fails."
  );
  // Initialize googleAI with default options, allowing fallback to ADC or other auth methods.
  plugins.push(googleAI(defaultGoogleAIOptions));
}

// This configuration explicitly tells Genkit to use the Google AI API key
// from the environment variables if provided, and sets a default model.
// Please ensure GOOGLE_API_KEY or GEMINI_API_KEY is set in your environment,
// or that Application Default Credentials (ADC) are configured if no key is provided.
export const ai = genkit({
  plugins: plugins,
});
