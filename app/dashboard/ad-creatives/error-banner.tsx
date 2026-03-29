import { AlertCircle } from "lucide-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-3 flex shrink-0 gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3.5 text-sm leading-relaxed text-destructive shadow-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p className="min-w-0 flex-1">{message}</p>
    </div>
  );
}
