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
    contexts: [];
    messages: [];
    model: T;
    onUpdate: (message: string) => Promise<void>;
    onFinish: (message: string) => Promise<void>;
    onError: (error: Error) => Promise<void>;
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

  export type SettingItemMethod<T> = {
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
        defaultValue: string;
      } & SettingItemMethod<string>)
    | ({
        type: SettingItemType.NumberRange;
        min: number;
        max: number;
        step: number;
        defaultValue: number;
      } & SettingItemMethod<number>)
    | ({
        type: SettingItemType.Number;
        min: number;
        max: number;
        defaultValue: number;
        placeholder: string;
      } & SettingItemMethod<number>)
    | {
        type: SettingItemType.Boolean;
        defaultValue: boolean;
      }
    | ({
        type: SettingItemType.Text;
        defaultValue: string;
        placeholder: string;
      } & SettingItemMethod<string>);

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
}
