import Image from "next/image";
import type { PersistedMessage } from "@/types/chat";

export function UserBubble({ message }: { message: PersistedMessage }) {
  const hasReferenceImages = message.referenceImageUrls.length > 0;

  return (
    <div className="flex justify-end">
      <div className="max-w-[82%] space-y-3">
        {hasReferenceImages && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.referenceImageUrls.map((url, index) => (
              <div
                key={`${message.id}-reference-${index}`}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-300"
              >
                <Image unoptimized src={url} alt="" fill className="object-cover" sizes="56px" />
              </div>
            ))}
          </div>
        )}
        <div className="rounded-2xl rounded-br-sm bg-zinc-900 px-5 py-4 text-base leading-relaxed text-white shadow-sm">
          {message.text}
        </div>
      </div>
    </div>
  );
}
