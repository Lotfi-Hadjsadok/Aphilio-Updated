import { BotAvatar } from "./bot-avatar";

export function ErrorBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <BotAvatar />
      <div className="rounded-2xl rounded-tl-sm border border-red-300 bg-red-50 px-5 py-4 text-base text-red-700">
        {text}
      </div>
    </div>
  );
}
