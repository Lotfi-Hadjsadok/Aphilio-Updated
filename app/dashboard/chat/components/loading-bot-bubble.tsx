import { BotAvatar } from "./bot-avatar";

export function LoadingBotBubble() {
  return (
    <div className="flex items-start gap-3">
      <BotAvatar />
      <div className="flex flex-col gap-3 rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-5 py-4 shadow-sm">
        {/* Animated image canvas placeholder */}
        <div className="relative h-44 w-44 overflow-hidden rounded-xl bg-zinc-100 sm:h-52 sm:w-52">
          {/* Shimmer sweep */}
          <div className="absolute inset-0 w-1/2 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          {/* Pulsing inner frame */}
          <div className="absolute inset-4 animate-pulse rounded-lg bg-zinc-200/80" />

          {/* Corner accent dots */}
          <span className="absolute left-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:0ms]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:200ms]" />
          <span className="absolute bottom-2 left-2 h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:400ms]" />
          <span className="absolute bottom-2 right-2 h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:600ms]" />

          {/* Center icon suggestion */}
          <svg
            className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-pulse text-zinc-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>

        {/* Status label with bouncing dots */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500">Generating image</span>
          <span className="flex gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
          </span>
        </div>
      </div>
    </div>
  );
}
