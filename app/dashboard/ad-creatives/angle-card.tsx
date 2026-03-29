"use client";

import {
  AlertCircle,
  Award,
  BadgePercent,
  Check,
  CircleCheck,
  Flame,
  Heart,
  Hourglass,
  Leaf,
  Lightbulb,
  Megaphone,
  Quote,
  Scale,
  ShieldCheck,
  Star,
  Target,
  Timer,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { adStudioAngleCardGradientWashCn } from "./ad-creatives-constants";

/** Icon + unselected tile colors matched to angle meaning (urgency = amber, trust = emerald, etc.). */
function deriveAngleVisual(angleText: string): {
  Icon: LucideIcon;
  idleWrapClass: string;
} {
  const lower = angleText.toLowerCase();

  if (
    /limited time|today only|last chance|ends (soon|tonight|midnight)|hurry|act now|countdown|deadline|while supplies last|don'?t miss|before it'?s gone/.test(
      lower,
    )
  ) {
    return {
      Icon: Timer,
      idleWrapClass:
        "border-amber-500/50 bg-amber-500/18 text-amber-900 shadow-md shadow-amber-500/15 ring-1 ring-amber-500/15 dark:border-amber-400/50 dark:bg-amber-400/18 dark:text-amber-100 dark:shadow-amber-950/40 dark:ring-amber-400/25",
    };
  }
  if (
    /pain point|painful|\bpain\b|problem|challenge|struggl|frustrat|difficult|overcome|barrier|obstacle|headache|stuck with/.test(
      lower,
    )
  ) {
    return {
      Icon: AlertCircle,
      idleWrapClass:
        "border-rose-500/50 bg-rose-500/18 text-rose-900 shadow-md shadow-rose-500/15 ring-1 ring-rose-500/15 dark:border-rose-400/50 dark:bg-rose-400/18 dark:text-rose-100 dark:shadow-rose-950/40 dark:ring-rose-400/25",
    };
  }
  if (/trust|safe|secur|reliable|proven|guarante|certif|credib|endors|warranty|money.back/.test(lower)) {
    return {
      Icon: ShieldCheck,
      idleWrapClass:
        "border-emerald-500/50 bg-emerald-500/18 text-emerald-950 shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/15 dark:border-emerald-400/50 dark:bg-emerald-400/18 dark:text-emerald-100 dark:shadow-emerald-950/40 dark:ring-emerald-400/25",
    };
  }
  if (/review|testimonial|rating|social proof|customers say|five.star|5.star|word of mouth|case stud/.test(lower)) {
    return {
      Icon: Quote,
      idleWrapClass:
        "border-sky-500/50 bg-sky-500/18 text-sky-950 shadow-md shadow-sky-500/15 ring-1 ring-sky-500/15 dark:border-sky-400/50 dark:bg-sky-400/18 dark:text-sky-100 dark:shadow-sky-950/40 dark:ring-sky-400/25",
    };
  }
  if (/community|together|team|social|network|connect|join|belong|membership tribe|fellow/.test(lower)) {
    return {
      Icon: Users,
      idleWrapClass:
        "border-indigo-500/50 bg-indigo-500/18 text-indigo-950 shadow-md shadow-indigo-500/15 ring-1 ring-indigo-500/15 dark:border-indigo-400/50 dark:bg-indigo-400/18 dark:text-indigo-100 dark:shadow-indigo-950/40 dark:ring-indigo-400/25",
    };
  }
  if (/fast|quick|instant|speed|rapid|24h|same.day|real.time|immediate|minutes not|in seconds/.test(lower)) {
    return {
      Icon: Zap,
      idleWrapClass:
        "border-yellow-500/55 bg-yellow-400/22 text-yellow-950 shadow-md shadow-yellow-500/20 ring-1 ring-yellow-500/20 dark:border-yellow-400/55 dark:bg-yellow-400/22 dark:text-yellow-50 dark:shadow-yellow-950/35 dark:ring-yellow-400/30",
    };
  }
  if (
    /save|discount|deal|price|cost|afford|value|budget|\bfree\b|free shipping|free trial|%\s*off|percent off|promo|coupon|cashback/.test(
      lower,
    )
  ) {
    return {
      Icon: BadgePercent,
      idleWrapClass:
        "border-green-600/50 bg-green-600/18 text-green-950 shadow-md shadow-green-600/15 ring-1 ring-green-600/15 dark:border-green-500/50 dark:bg-green-500/18 dark:text-green-100 dark:shadow-green-950/40 dark:ring-green-500/25",
    };
  }
  if (/easy|simple|hassle|effortless|one.click|no brainer|straightforward|set and forget|plug and play/.test(lower)) {
    return {
      Icon: CircleCheck,
      idleWrapClass:
        "border-teal-500/50 bg-teal-500/18 text-teal-950 shadow-md shadow-teal-500/15 ring-1 ring-teal-500/15 dark:border-teal-400/50 dark:bg-teal-400/18 dark:text-teal-100 dark:shadow-teal-950/40 dark:ring-teal-400/25",
    };
  }
  if (/eco|sustain|green|natural|organic|carbon|planet|ethical source/.test(lower)) {
    return {
      Icon: Leaf,
      idleWrapClass:
        "border-lime-600/50 bg-lime-600/18 text-lime-950 shadow-md shadow-lime-600/15 ring-1 ring-lime-600/15 dark:border-lime-500/50 dark:bg-lime-500/18 dark:text-lime-100 dark:shadow-lime-950/40 dark:ring-lime-500/25",
    };
  }
  if (/compare|versus|\bvs\.|alternative to|better than|switch from|side.by.side/.test(lower)) {
    return {
      Icon: Scale,
      idleWrapClass:
        "border-violet-500/50 bg-violet-500/18 text-violet-950 shadow-md shadow-violet-500/15 ring-1 ring-violet-500/15 dark:border-violet-400/50 dark:bg-violet-400/18 dark:text-violet-100 dark:shadow-violet-950/40 dark:ring-violet-400/25",
    };
  }
  if (
    /target audience|target market|niche|segment|demographic|persona|ideal customer|\btargeting\b|reach the right/.test(
      lower,
    )
  ) {
    return {
      Icon: Target,
      idleWrapClass:
        "border-fuchsia-500/50 bg-fuchsia-500/18 text-fuchsia-950 shadow-md shadow-fuchsia-500/15 ring-1 ring-fuchsia-500/15 dark:border-fuchsia-400/50 dark:bg-fuchsia-400/18 dark:text-fuchsia-100 dark:shadow-fuchsia-950/40 dark:ring-fuchsia-400/25",
    };
  }
  if (/new|innovat|future|tech|modern|smart|digital|\bai\b|automat|cutting.edge|next.gen/.test(lower)) {
    return {
      Icon: Lightbulb,
      idleWrapClass:
        "border-amber-400/55 bg-amber-400/22 text-amber-950 shadow-md shadow-amber-400/20 ring-1 ring-amber-400/20 dark:border-amber-300/55 dark:bg-amber-400/22 dark:text-amber-50 dark:shadow-amber-950/35 dark:ring-amber-300/30",
    };
  }
  if (/feel|love|passion|emotion|inspir|transform|life|joy|happin|wellbeing|lifestyle|dream/.test(lower)) {
    return {
      Icon: Heart,
      idleWrapClass:
        "border-pink-500/50 bg-pink-500/18 text-pink-950 shadow-md shadow-pink-500/15 ring-1 ring-pink-500/15 dark:border-pink-400/50 dark:bg-pink-400/18 dark:text-pink-100 dark:shadow-pink-950/40 dark:ring-pink-400/25",
    };
  }
  if (/result|achieve|goal|success|growth|increas|boost|improv|\broi\b|metric|revenue|scale your/.test(lower)) {
    return {
      Icon: TrendingUp,
      idleWrapClass:
        "border-emerald-600/50 bg-emerald-600/18 text-emerald-950 shadow-md shadow-emerald-600/15 ring-1 ring-emerald-600/15 dark:border-emerald-500/50 dark:bg-emerald-500/18 dark:text-emerald-100 dark:shadow-emerald-950/40 dark:ring-emerald-500/25",
    };
  }
  if (/award|expert|authority|thought leader|industry leader|certified|\baccolade\b|years of experience/.test(lower)) {
    return {
      Icon: Award,
      idleWrapClass:
        "border-amber-600/50 bg-amber-600/18 text-amber-950 shadow-md shadow-amber-600/15 ring-1 ring-amber-600/15 dark:border-amber-500/50 dark:bg-amber-500/18 dark:text-amber-100 dark:shadow-amber-950/40 dark:ring-amber-500/25",
    };
  }
  if (/premium|quality|luxury|elite|excellence|superior|high.end|best.in.class|gold standard/.test(lower)) {
    return {
      Icon: Star,
      idleWrapClass:
        "border-amber-500/55 bg-amber-500/22 text-amber-950 shadow-md shadow-amber-500/20 ring-1 ring-amber-500/20 dark:border-amber-400/55 dark:bg-amber-400/22 dark:text-amber-50 dark:shadow-amber-950/35 dark:ring-amber-400/30",
    };
  }
  if (/exclusive|limited edition|rare|scarc|vip|members.only|few left|while stock|one.of.a.kind|bespoke/.test(lower)) {
    return {
      Icon: Hourglass,
      idleWrapClass:
        "border-orange-500/50 bg-orange-500/18 text-orange-950 shadow-md shadow-orange-500/15 ring-1 ring-orange-500/15 dark:border-orange-400/50 dark:bg-orange-400/18 dark:text-orange-100 dark:shadow-orange-950/40 dark:ring-orange-400/25",
    };
  }
  if (/trend|viral|hot right now|buzz|fomo|everyone'?s talking|sellout|sold out fast/.test(lower)) {
    return {
      Icon: Flame,
      idleWrapClass:
        "border-orange-600/55 bg-orange-600/22 text-orange-950 shadow-md shadow-orange-600/20 ring-1 ring-orange-600/20 dark:border-orange-500/55 dark:bg-orange-500/22 dark:text-orange-100 dark:shadow-orange-950/40 dark:ring-orange-500/30",
    };
  }
  return {
    Icon: Megaphone,
    idleWrapClass:
      "border-slate-500/45 bg-slate-500/16 text-slate-900 shadow-md shadow-slate-500/12 ring-1 ring-slate-500/15 dark:border-slate-400/50 dark:bg-slate-400/18 dark:text-slate-100 dark:shadow-black/30 dark:ring-slate-400/25",
  };
}

export function AngleCard({
  angleText,
  selected,
  onToggle,
}: {
  index: number;
  angleText: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const tAngle = useTranslations("adCreatives.angleCard");
  const { Icon, idleWrapClass } = deriveAngleVisual(angleText);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={tAngle("ariaToggle", { angle: angleText })}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ease-out",
        selected
          ? "border-border/50 bg-card/55 shadow-lg shadow-black/8 ring-2 ring-white/25 dark:bg-card/50 dark:shadow-black/35"
          : "border-border/45 bg-card/45 shadow-sm shadow-black/5 hover:-translate-y-0.5 hover:border-border/80 hover:bg-card/75 hover:shadow-md hover:shadow-black/10 active:translate-y-0 dark:shadow-black/20 dark:hover:shadow-black/30",
      )}
    >
      {selected ? <span className={adStudioAngleCardGradientWashCn} aria-hidden /> : null}
      <span className="relative z-10 flex w-full items-center gap-3">
        <span className="relative shrink-0" aria-hidden>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border transition-all duration-200",
              selected
                ? cn(idleWrapClass, "scale-105")
                : idleWrapClass,
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          {selected ? (
            <span className="absolute -right-1.5 -top-1.5 flex size-[1.1rem] items-center justify-center rounded-full bg-accent-gradient shadow ring-[1.5px] ring-background">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
          ) : null}
        </span>
        <span className="flex-1 text-left text-sm font-semibold leading-snug text-foreground">
          {angleText}
        </span>
      </span>
    </button>
  );
}
