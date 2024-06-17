import type { ReadableStream } from 'stream/web';

import type { AxTracer } from '../trace/index.js';

export type AxModelInfo = {
  name: string;
  currency?: string;
  characterIsToken?: boolean;
  promptTokenCostPer1M?: number;
  completionTokenCostPer1M?: number;
  aliases?: string[];
};

export type AxTokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type AxModelConfig = {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
  endSequences?: string[];
  stream?: boolean;
  n?: number;
};

export type AxFunctionHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any,
  extra?: Readonly<{
    sessionId?: string;
    traceId?: string;
  }>
) => unknown;

export type AxFunctionJSONSchema = {
  type: string;
  properties?: Record<
    string,
    AxFunctionJSONSchema & {
      enum?: string[];
      default?: unknown;
      description: string;
    }
  >;
  required?: string[];
  items?: AxFunctionJSONSchema;
};

export type AxFunction = {
  name: string;
  description: string;
  parameters?: AxFunctionJSONSchema;
  func?: AxFunctionHandler;
};

export type AxChatResponseResult = {
  content: string | null;
  name?: string;
  id?: string;
  functionCalls?: {
    id: string;
    type: 'function';
    // eslint-disable-next-line functional/functional-parameters
    function: { name: string; arguments?: string | object };
  }[];
  finishReason?:
    | 'stop'
    | 'length'
    | 'function_call'
    | 'content_filter'
    | 'error';
};

export type AxChatResponse = {
  sessionId?: string;
  remoteId?: string;
  results: readonly AxChatResponseResult[];
  modelUsage?: AxTokenUsage;
  embedModelUsage?: AxTokenUsage;
};

export type AxEmbedResponse = {
  remoteId?: string;
  sessionId?: string;
  embeddings: readonly (readonly number[])[];
  modelUsage?: AxTokenUsage;
};

export type AxModelInfoWithProvider = AxModelInfo & { provider: string };

export type AxChatRequest = {
  chatPrompt: Readonly<
    | { role: 'system'; content: string }
    | { role: 'user'; content: string; name?: string }
    | {
        role: 'assistant';
        content: string | null;
        name?: string;
        functionCalls?: {
          id: string;
          type: 'function';
          // eslint-disable-next-line functional/functional-parameters
          function: { name: string; arguments?: string | object };
        }[];
      }
    | { role: 'function'; content: string; functionId: string }
  >[];
  functions?: Readonly<{
    name: string;
    description: string;
    parameters?: AxFunctionJSONSchema;
  }>[];
  functionCall?:
    | 'none'
    | 'auto'
    | 'required'
    | { type: 'function'; function: { name: string } };
  modelConfig?: Readonly<AxModelConfig>;
  modelInfo?: Readonly<AxModelInfoWithProvider>;
};

export type AxEmbedRequest = {
  texts?: readonly string[];
  embedModelInfo?: Readonly<AxModelInfoWithProvider>;
};

export type AxRateLimiterFunction = <T>(func: unknown) => T;

export type AxAIPromptConfig = {
  stream?: boolean;
};

export type AxAIServiceOptions = {
  debug?: boolean;
  rateLimiter?: AxRateLimiterFunction;
  fetch?: typeof fetch;
  tracer?: AxTracer;
};

export type AxAIServiceActionOptions = {
  sessionId?: string;
  traceId?: string;
};

export interface AxAIService {
  getName(): string;
  getModelInfo(): Readonly<AxModelInfo & { provider: string }>;
  getEmbedModelInfo(): Readonly<AxModelInfo> | undefined;
  getModelConfig(): Readonly<AxModelConfig>;
  getFeatures(): { functions: boolean; streaming: boolean };

  chat(
    req: Readonly<AxChatRequest>,
    options?: Readonly<AxAIPromptConfig & AxAIServiceActionOptions>
  ): Promise<AxChatResponse | ReadableStream<AxChatResponse>>;
  embed(
    req: Readonly<AxEmbedRequest>,
    options?: Readonly<AxAIServiceActionOptions & AxAIServiceActionOptions>
  ): Promise<AxEmbedResponse>;

  setOptions(options: Readonly<AxAIServiceOptions>): void;
}
