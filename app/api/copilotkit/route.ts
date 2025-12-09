import { NextRequest } from 'next/server';
import { CopilotRuntime, LangChainAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { ChatOpenAI } from "@langchain/openai";

export async function POST(req: NextRequest) {
  const model = new ChatOpenAI({
    modelName: process.env.MODEL,
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE_URL?.trim(),
    },
  });

  const serviceAdapter = new LangChainAdapter({
    chainFn: async ({ messages, tools }) => {
      return model.stream(messages, { tools });
    }
  });

  const runtime = new CopilotRuntime();

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
}
