import type { ChatAspectRatio } from "@/types/chat";

export const ASPECT_RATIOS: {
  value: ChatAspectRatio;
  label: string;
  shape: string;
}[] = [
  { value: "1:1", label: "1:1", shape: "h-3.5 w-3.5 rounded-none" },
  { value: "16:9", label: "16:9", shape: "h-[0.9rem] w-[1.6rem] rounded-none" },
  { value: "9:16", label: "9:16", shape: "h-[1rem] w-[0.56rem] rounded-none" },
  { value: "4:5", label: "4:5", shape: "h-[0.94rem] w-3 rounded-none" },
];

export const EMPTY_IMAGES_PROMISE = Promise.resolve<string[]>([]);
