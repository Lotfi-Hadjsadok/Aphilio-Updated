import type { GenerateImageState } from "@/types/ad-creatives";

const AD_CREATIVE_GENERATE_IMAGE_PATH = "/api/ad-creatives/generate-image";

export async function postAdCreativeGenerateImage(formData: FormData): Promise<GenerateImageState> {
  const response = await fetch(AD_CREATIVE_GENERATE_IMAGE_PATH, {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });
  return (await response.json()) as GenerateImageState;
}
