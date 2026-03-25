import "server-only";

import { OpenRouter } from "@openrouter/sdk";
import { saasTemplateConstants } from "@/lib/saas-template-constants";
import type { FillTemplatesFromContextInput, FilledTemplate } from "@/types/openrouter";

export type { FilledTemplate } from "@/types/openrouter";

let openRouterSingleton: OpenRouter | null = null;

function getOpenRouterClient(): OpenRouter {
  if (openRouterSingleton) return openRouterSingleton;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required.");
  }
  openRouterSingleton = new OpenRouter({ apiKey });
  return openRouterSingleton;
}

type EmbeddingsPayload = { data: Array<{ index?: number; embedding: number[] }> };

export async function embedTextsForContextDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getOpenRouterClient();

  const response = (await client.embeddings.generate({
    requestBody: {
      model: "openai/text-embedding-3-small",
      input: texts,
      encodingFormat: "float",
    },
  })) as EmbeddingsPayload;

  const rows = [...response.data].sort(
    (left, right) => (left.index ?? 0) - (right.index ?? 0),
  );
  return rows.map((row) => row.embedding);
}

export async function fillTemplatesFromContext(
  input: FillTemplatesFromContextInput,
): Promise<FilledTemplate[]> {
  const uniqueTemplateIndexes = [...new Set(input.templateIndexes)];
  const selectedTemplates = uniqueTemplateIndexes.map((templateIndex) => ({
    templateIndex,
    template: saasTemplateConstants[templateIndex - 1]!,
  }));

  const templatePayload = selectedTemplates.map(({ templateIndex, template }) => ({
    templateIndex,
    prompt: template.prompt,
    description: template.description,
    needs: template.needs,
    defaultAspectRatio: template.default_aspect_ratio,
  }));

  const response = await getOpenRouterClient().chat.send({
    chatGenerationParams: {
      model: "openai/gpt-4.1-nano",
      temperature: 0.2,
      stream: false,
      debug: {
        echoUpstreamBody: true,
      },
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You fill SaaS ad templates from brand context. Output valid JSON only. Do not include markdown fences.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              task:
                "For each template, fill every variable from `needs` with specific, high-quality values grounded in `context`. Then produce `filledPrompt` by replacing each [VARIABLE] token in `prompt` with its value from `filledVariables`.",
              outputShape: {
                templates: [
                  {
                    templateIndex: "number",
                    filledVariables: { VARIABLE_NAME: "string" },
                    filledPrompt: "string",
                  },
                ],
              },
              requirements: [
                "Return all requested templates.",
                "Include all keys listed in each template's `needs`.",
                "Use concise but concrete language.",
                "Do not invent placeholder tokens in the final prompt.",
              ],
              context: input.context,
              templates: templatePayload,
            },
            null,
            2,
          ),
        },
      ],
    },
  });

  const modelContent = response.choices[0]?.message?.content as string | undefined;
  if (!modelContent) return [];

  const parsed = JSON.parse(modelContent) as { templates: FilledTemplate[] };
  return parsed.templates ?? [];
}
