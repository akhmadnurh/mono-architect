import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const customAiProvider = createOpenAICompatible({
  name: 'openrouter',
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY,
});
