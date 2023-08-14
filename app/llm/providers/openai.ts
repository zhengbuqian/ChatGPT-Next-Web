import Locale from "../../locales";
import { OPENAI_URL } from "@/app/api/common";
import { LLM } from "../types";
import { defineProvider } from "..";

export const OpenAIDescriptor = {
  name: "OpenAI" as const,

  paths: {
    chat: "v1/chat/completions",
    listModels: "v1/models",
  },

  defaultModel: "gpt-3.5-turbo",
  summarizeModel: "gpt-3.5-turbo",

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
    orgId: LLM.createConfigItem({
      key: "orgId",
      name: Locale.Settings.Token.Title,
      desc: Locale.Settings.Token.SubTitle,
      input: {
        type: LLM.SettingItemType.Text,
        defaultValue: "",
        placeholder: Locale.Settings.Token.Placeholder,
      },
      env: {
        type: LLM.EnvItemType.Text,
        name: "OPENAI_ORG_ID",
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
    createClient(store, fetchOptions: RequestInit) {
      const config = store.getConfig(descriptor);
      const options: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          ...(!!config.orgId && {
            "OpenAI-Organization": config.orgId,
          }),
        },
      };

      return {
        getFullPath(path: keyof typeof descriptor.paths) {
          let url = config.endpoint;
          if (url.endsWith("/")) {
            url = url.slice(0, url.length - 1);
          }
          return [url, descriptor.paths[path]].join("/");
        },

        extractMessage(res: any) {
          return res.choices?.at(0)?.message?.content ?? "";
        },

        async chat(params) {
          const messages = params.contexts.concat(params.messages).map((v) => ({
            role: v.role,
            content: v.content,
          }));

          const requestPayload = {
            messages,
            stream: false,
            model: params.model,
            temperature: config.temperature,
            presence_penalty: config.presence_penalty,
            frequency_penalty: config.frequency_penalty,
            top_p: config.top_p,
          };

          console.log("[Request] openai payload: ", requestPayload);

          const controller = new AbortController();
          params.onController?.(controller);

          try {
            const response = await fetch(this.getFullPath("chat"), {
              ...options,
              method: "post",
              body: JSON.stringify(requestPayload),
            });

            const resJson = await response.json();
            const message = this.extractMessage(resJson);
            params.onFinish(message);
          } catch (e) {
            console.log("[Request] failed to make a chat request", e);
            params.onError(e as Error);
          }
        },
        async chatStream(params) {},
        async text(params) {},
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
