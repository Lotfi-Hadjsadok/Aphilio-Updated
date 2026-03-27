import type { BrandingDNA, BrandingPersonality } from "@/types/scrape";

export function PersonalityStrip({
  branding,
  personality,
  brandName,
}: {
  branding: BrandingDNA | null;
  personality: BrandingPersonality | null;
  brandName: string;
}) {
  const { primary, secondary } = branding?.colors ?? { primary: null, secondary: null };

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/10 p-3.5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="font-heading text-sm font-semibold text-foreground">{brandName}</span>
        <div className="flex gap-1.5">
          {primary ? (
            <span
              className="size-5 rounded-md ring-1 ring-border/60"
              style={{ backgroundColor: primary }}
              title={`Primary ${primary}`}
            />
          ) : null}
          {secondary ? (
            <span
              className="size-5 rounded-md ring-1 ring-border/60"
              style={{ backgroundColor: secondary }}
              title={`Secondary ${secondary}`}
            />
          ) : null}
        </div>
      </div>
      {personality ? (
        <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{personality.archetype}</span>
          {" · "}
          {personality.tone}
          {" · "}
          {personality.audience}
        </p>
      ) : null}
    </div>
  );
}
