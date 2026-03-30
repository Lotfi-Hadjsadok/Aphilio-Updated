"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BotAvatar } from "./bot-avatar";
import { ReferenceThumbsRow } from "./reference-thumbs-row";
import type { PersistedMessage } from "@/types/chat";

export function BotBubble({ message }: { message: PersistedMessage }) {
  const t = useTranslations("chat.botBubble");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <BotAvatar />
        <div className="min-w-0 flex-1">
          {message.contextName && (
            <p className="mb-1 text-xs text-zinc-500">
              {t("contextLabel")}{" "}
              <span className="font-medium text-zinc-800">{message.contextName}</span>
              {message.aspectRatio && (
                <span className="ml-2 rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-[0.65rem] text-zinc-600">
                  {message.aspectRatio}
                </span>
              )}
            </p>
          )}
          {message.imageUrl ? (
            <div className="max-w-[14rem] overflow-hidden rounded-2xl rounded-tl-sm border border-zinc-300 bg-white shadow-sm sm:max-w-[18rem]">
              <div className="relative w-full">
                <Image
                  unoptimized
                  src={message.imageUrl}
                  alt={t("generatedImageAlt")}
                  width={360}
                  height={360}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 640px) 56vw, 288px"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl rounded-tl-sm border border-zinc-300 bg-white px-5 py-4 text-base text-zinc-900 shadow-sm">
              {message.text ?? "…"}
            </div>
          )}
        </div>
      </div>
      {message.referenceImageUrls.length > 0 && (
        <ReferenceThumbsRow urls={message.referenceImageUrls} />
      )}
      {message.imageUrl && (
        <p className="pl-14 text-xs text-zinc-500">{t("savedToLibrary")}</p>
      )}
    </div>
  );
}
