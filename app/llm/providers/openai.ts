import Locale from "../../locales";
import { OPENAI_URL } from "@/app/api/common";
import { type NextRequest } from "next/server";
import { LLM } from "../types";

export const OpenAIDescriptor = {
  name: "OpenAI" as const,
  models: [
    LLM.createModel({
      name: "gpt-3.5-turbo",
      enable: true,
      type: LLM.ModelType.Chat,
    } as const),
    LLM.createModel({
      name: "gpt-4",
      enable: true,
      type: LLM.ModelType.Chat,
    } as const),
    LLM.createModel({
      name: "gpt-3.5-16k",
      enable: true,
      type: LLM.ModelType.Chat,
    } as const),
  ],

  defaultModel: "gpt-3.5-turbo",
  summarizeModel: "gpt-3.5-turbo",

  config: {
    endpoint: LLM.createConfigItem({
      key: "endpoint",
      name: Locale.Settings.Endpoint.Title,
      desc: Locale.Settings.Endpoint.SubTitle,
      input: {
        type: LLM.SettingItemType.Text,
        defaultValue: "/api/openai",
        placeholder: OPENAI_URL,
      },
      env: {
        type: LLM.EnvItemType.Text,
        name: "BASE_URL",
        defaultValue: OPENAI_URL,
      },
    }),
    apiKey: LLM.createConfigItem({
      key: "apiKey",
      name: Locale.Settings.Token.Title,
      desc: Locale.Settings.Token.SubTitle,
      input: {
        type: LLM.SettingItemType.Text,
        defaultValue: "",
        placeholder: Locale.Settings.Token.Placeholder,
      },
    }),
  },

  modelConfig: {
    temperature: LLM.createConfigItem({
      key: "temperature",
      name: Locale.Settings.Temperature.Title,
      desc: Locale.Settings.Temperature.SubTitle,
      input: {
        type: LLM.SettingItemType.NumberRange,
        defaultValue: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
      },
    }),
    top_p: LLM.createConfigItem({
      key: "top_p",
      name: Locale.Settings.TopP.Title,
      desc: Locale.Settings.TopP.SubTitle,
      input: {
        type: LLM.SettingItemType.NumberRange,
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.1,
      },
    }),
    max_tokens: LLM.createConfigItem({
      key: "max_tokens",
      name: Locale.Settings.Token.Title,
      desc: Locale.Settings.Token.SubTitle,
      input: {
        type: LLM.SettingItemType.Number,
        min: 0,
        max: 32000,
        defaultValue: 4096,
        placeholder: Locale.Settings.Token.Placeholder,
      },
    }),
    presence_penalty: LLM.createConfigItem({
      key: "presence_penalty",
      name: Locale.Settings.PresencePenalty.Title,
      desc: Locale.Settings.PresencePenalty.SubTitle,
      input: {
        type: LLM.SettingItemType.NumberRange,
        defaultValue: 0,
        min: 0,
        max: 1,
        step: 0.1,
      },
    }),
    frequency_penalty: LLM.createConfigItem({
      key: "frequency_penalty",
      name: Locale.Settings.FrequencyPenalty.Title,
      desc: Locale.Settings.FrequencyPenalty.SubTitle,
      input: {
        type: LLM.SettingItemType.NumberRange,
        defaultValue: 0,
        min: 0,
        max: 1,
        step: 0.1,
      },
    }),
  },
};

type InferConfigType<T> = T extends number
  ? number
  : T extends string
  ? string
  : T;
type InferModelConfig<T> = T extends LLM.Descriptor<
  infer _A,
  infer _B,
  infer _C,
  infer _D,
  infer _E
>
  ? {
      config: {
        [K in keyof T["config"]]: InferConfigType<
          T["config"][K]["input"]["defaultValue"]
        >;
      } & {
        [K in keyof T["modelConfig"]]: InferConfigType<
          T["modelConfig"][K]["input"]["defaultValue"]
        >;
      };
      model: T["models"][number]["name"];
      client: LLM.Client<T["models"][number]["name"]>;
    }
  : never;
type InferDescriptorMeta<T> = T extends LLM.Descriptor<
  infer _A,
  infer _B,
  infer _C,
  infer _D,
  infer _E
>
  ? InferModelConfig<T> & {
      provider: {
        descriptor: T;
        fromStore(
          store: LLM.Store<InferModelConfig<T>["config"]>,
        ): InferModelConfig<T>["client"];
        fromServer(request: NextRequest): InferModelConfig<T>["client"];
        createClient(
          config: InferModelConfig<T>["config"],
        ): InferModelConfig<T>["client"];
      };
    }
  : never;

type OpenAIDescriptorMeta = InferDescriptorMeta<typeof OpenAIDescriptor>;

const OpenAIProvider: OpenAIDescriptorMeta["provider"] = {
  descriptor: OpenAIDescriptor,
  fromStore(store) {
    const descriptor = this.descriptor;
    const config = store.getConfig(descriptor);
    return this.createClient(config);
  },

  fromServer(request) {
    const config = request.headers as any;
    return this.createClient(config);
  },

  createClient(config) {
    const descriptor = this.descriptor;
    return {
      async text(params) {},
      async chat(params) {},
      async chatStream(params) {},
      async embedding(chunks) {
        return [];
      },
      async models() {
        return descriptor.models.map((m) => m.name);
      },
    };
  },
};

const Descriptors = [OpenAIDescriptor] as const;

const Providers = [OpenAIProvider];
export type AllModelName =
  (typeof Descriptors)[number]["models"][number]["name"];

type ProviderName = (typeof Providers)[number]["descriptor"]["name"];

// TODO: 将 descriptor 和 provider 整合到 defineProvider 函数中
function defineProvider<T>(
  descriptor: T,
  provider: InferDescriptorMeta<T>["provider"],
) {
  return {
    descriptor,
    provider,
  };
}

export function createProvider(name: ProviderName) {}
