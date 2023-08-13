import Locale from "../../locales";
import { OPENAI_URL } from "@/app/api/common";
import { LLM } from "../types";
import { defineProvider } from "..";

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
      env: {
        type: LLM.EnvItemType.Text,
        name: "OPENAI_API_KEY",
        defaultValue: "",
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

export const OpenAIProvider = defineProvider(
  OpenAIDescriptor,
  (descriptor) => ({
    fromStore(store) {
      const config = store.getConfig(descriptor);
      return this.createClient(config);
    },

    fromServer(request) {
      const config = request.headers as any;
      return this.createClient(config);
    },

    createClient(config) {
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
  }),
);
