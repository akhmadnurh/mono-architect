/**
 * Centralized AI model configuration.
 * GLM 5.3 Flash (ZhipuAI) as the single default model across all generators.
 */
export const AI_BASE_URL = process.env.AI_BASE_URL || "";
export const AI_API_KEY = process.env.AI_API_KEY || "";
export const MODEL_ID = process.env.AI_MODEL || "glm-5.3-flash";
