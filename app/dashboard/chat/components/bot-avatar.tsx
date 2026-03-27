import Image from "next/image";
import { cn } from "@/lib/utils";

export function BotAvatar({ small = false }: { small?: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-full bg-accent-gradient-subtle ring-1 ring-black/10",
        small ? "h-8 w-8" : "h-11 w-11",
      )}
    >
      <Image
        unoptimized
        src="/aphilio-logo.webp"
        alt="Aphilio"
        width={44}
        height={44}
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}
