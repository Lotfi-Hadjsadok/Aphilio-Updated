import { X } from "lucide-react";

export function UploadedThumb({
  dataUrl,
  onRemove,
}: {
  dataUrl: string;
  onRemove: () => void;
}) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-300">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-md bg-white/95 text-zinc-600 hover:text-zinc-900"
        aria-label="Remove image"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
