import Image from "next/image";
import { cn } from "@/lib/utils";

const demoImageDimensions: Record<string, { width: number; height: number }> = {
  "/demos/dna-preview-demo.webp": { width: 2777, height: 2028 },
  "/demos/ad-creative-generation-demo.webp": { width: 2118, height: 1783 },
  "/demos/creative-library-demo.webp": { width: 2464, height: 1972 },
  "/demos/chat-demo.webp": { width: 2718, height: 2021 },
};

export function LandingDemoImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const pixels = demoImageDimensions[src];
  if (!pixels) {
    throw new Error(`Missing demoImageDimensions for ${src}`);
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={pixels.width}
      height={pixels.height}
      sizes={sizes}
      priority={priority}
      className={cn(
        "h-auto w-full max-w-full object-contain object-top",
        className,
      )}
    />
  );
}
