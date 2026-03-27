import type { ChatAspectRatio } from "@/types/chat";

export const ASPECT_RATIOS: {
  value: ChatAspectRatio;
  label: string;
  shape: string;
}[] = [
  { value: "1:1", label: "1:1", shape: "w-3.5 h-3.5" },
  { value: "16:9", label: "16:9", shape: "w-[1.6rem] h-[0.9rem]" },
  { value: "9:16", label: "9:16", shape: "w-[0.56rem] h-[1rem]" },
  { value: "4:5", label: "4:5", shape: "w-3 h-[0.94rem]" },
];

export const EMPTY_IMAGES_PROMISE = Promise.resolve<string[]>([]);
