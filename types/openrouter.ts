import type { SaaSTemplateDefinition } from "@/lib/saas-template-constants";

export type FilledTemplate = {
  templateIndex: number;
  prompt: string;
  description: string;
  defaultAspectRatio: SaaSTemplateDefinition["default_aspect_ratio"];
  needs: string[];
  filledVariables: Record<string, string>;
  filledPrompt: string;
};

export type FillTemplatesFromContextInput = {
  templateIndexes: number[];
  context: string;
};
