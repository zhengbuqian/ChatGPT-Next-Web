import { ChatMessage } from "../store";

export namespace LLM {
  export enum ModelType {
    Text,
    Chat,
    Embedding,
  }

  export interface Store<
    T extends Record<any, any>,
    D = Descriptor<string, {}, string, {}, string>,
  > {
    getConfig: (descriptor: D) => T;
    setConfig: (descriptor: D, config: T) => void;
  }

  type ChatParams<T> = {
    contexts: ChatMessage[];
    messages: ChatMessage[];
    model: T;
    onUpdate: (message: string) => Promise<void>;
    onFinish: (message: string) => Promise<void>;
    onError: (error: Error) => Promise<void>;
    onController?: (controller: AbortController) => void;
  };

  export interface Client<T = string> {
    text: (params: { text: string; model: T }) => Promise<void>;

    chat: (params: ChatParams<T>) => Promise<void>;
    chatStream: (params: ChatParams<T>) => Promise<void>;

    embedding: (
      chunks: string[],
      model: T,
    ) => Promise<Array<{ chunk: string; embeddings: number[] }>>;

    models: () => Promise<string[]>;
  }

  export enum SettingItemType {
    Enum,
    NumberRange,
    Number,
    Boolean,
    Text,
  }

  export type SettingItemCommon<T> = {
    defaultValue: T;
    format?: (value: T) => string;
    valid?: (value: T) => { isValid: boolean; message: string };
  };

  export type InputSettingItem =
    | ({
        type: SettingItemType.Enum;
        options: Array<{
          name: string;
          value: string;
        }>;
      } & SettingItemCommon<string>)
    | ({
        type: SettingItemType.NumberRange;
        min: number;
        max: number;
        step: number;
      } & SettingItemCommon<number>)
    | ({
        type: SettingItemType.Number;
        min: number;
        max: number;
        placeholder: string;
      } & SettingItemCommon<number>)
    | {
        type: SettingItemType.Boolean;
        defaultValue: boolean;
      }
    | ({
        type: SettingItemType.Text;
        placeholder: string;
      } & SettingItemCommon<string>);

  export enum EnvItemType {
    Text,
    Number,
    Boolean,
  }

  export type EnvSettingItem = { name: string } & (
    | {
        type: EnvItemType.Text;
        defaultValue: string;
      }
    | {
        type: EnvItemType.Number;
        defaultValue: number;
      }
    | {
        type: EnvItemType.Boolean;
        defaultValue: boolean;
      }
  );

  export interface ConfigItem {
    key: string;
    name: string;
    desc: string;
    input: InputSettingItem;
    env?: EnvSettingItem;
  }

  export const createConfigItem = <T extends ConfigItem>(item: T): T => item;

  export interface Model {
    readonly name: string;
    enable: boolean;
    type: LLM.ModelType;
  }

  export const createModel = <T extends Model>(item: T) => item;

  export interface Descriptor<
    M,
    C extends { [_ in K]: ConfigItem },
    K extends string | number | symbol,
    MC extends { [_ in MK]: ConfigItem },
    MK extends string | number | symbol,
  > {
    name: string;
    models: readonly { name: M; enable: boolean; type: LLM.ModelType }[];
    defaultModel: M;
    summarizeModel: M;
    config: C;
    modelConfig: MC;
  }

  export type InferConfigType<T> = T extends number
    ? number
    : T extends string
    ? string
    : T;

  export type InferModelConfig<T> = T extends LLM.Descriptor<
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

  export type InferProviderMeta<T> = T extends LLM.Descriptor<
    infer _A,
    infer _B,
    infer _C,
    infer _D,
    infer _E
  >
    ? InferModelConfig<T> & {
        provider: {
          createClient(
            store: Store<InferModelConfig<T>["config"]>,
            fetchOptions: RequestInit,
          ): InferModelConfig<T>["client"];
        };
      }
    : never;
}
