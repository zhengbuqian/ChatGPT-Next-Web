import { LLMProvider, LLMProviders, ProviderName } from "./providers";
import { LLM } from "./types";

export function defineProvider<
  T,
  P extends LLM.InferProviderMeta<T>["provider"],
>(descriptor: T, provider: (descriptor: T) => P) {
  return {
    descriptor,
    ...provider(descriptor),
  };
}

export function createProvider(name: ProviderName): LLMProvider {
  const provider = LLMProviders.find((p) => p.descriptor.name === name);
  if (!provider) {
    throw Error("[LLM] can not find provider: " + name);
  }
  return provider;
}

const provider = createProvider("OpenAI");
