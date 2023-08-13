import { OpenAIProvider } from "./openai";

export const LLMProviders = [OpenAIProvider] as const;

export type ProviderName = (typeof LLMProviders)[number]["descriptor"]["name"];
export type LLMProvider = (typeof LLMProviders)[number];
