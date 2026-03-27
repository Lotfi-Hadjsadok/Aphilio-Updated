export type AdAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export type AspectRatioOption = {
  value: AdAspectRatio;
  label: string;
  note: string;
  /** Tailwind width class for the visual shape indicator. */
  wClass: string;
  /** Tailwind height class for the visual shape indicator. */
  hClass: string;
};

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { value: "1:1",  label: "Square",    note: "Facebook · Instagram Feed", wClass: "w-8", hClass: "h-8" },
  { value: "4:5",  label: "Portrait",  note: "Instagram Feed",            wClass: "w-7", hClass: "h-9" },
  { value: "9:16", label: "Story",     note: "Reels · TikTok · Stories",  wClass: "w-5", hClass: "h-9" },
  { value: "16:9", label: "Landscape", note: "YouTube · LinkedIn",        wClass: "w-9", hClass: "h-5" },
];

export type AdTemplate = {
  id: string;
  label: string;
};

export type AdTemplateCategory = {
  id: string;
  label: string;
  templates: AdTemplate[];
};

export const AD_TEMPLATE_CATEGORIES: AdTemplateCategory[] = [
  {
    id: "pain-emotion",
    label: "Pain & Emotion",
    templates: [
      { id: "problem-pain",      label: "Problem / Pain" },
      { id: "problem-solution",  label: "Problem → Solution" },
      { id: "before-after",      label: "Before / After" },
      { id: "bold-claim",        label: "Bold Claim / Hook" },
      { id: "results-numbers",   label: "Results / Numbers" },
    ],
  },
  {
    id: "product-feature",
    label: "Product & Feature",
    templates: [
      { id: "product-ui-showcase",  label: "Product UI Showcase" },
      { id: "feature-highlight",    label: "Feature Highlight" },
      { id: "feature-grid",         label: "Feature Grid" },
      { id: "demo-snapshot",        label: "Demo Snapshot (UI Step)" },
    ],
  },
  {
    id: "social-proof",
    label: "Social Proof",
    templates: [
      { id: "testimonial-quote",    label: "Testimonial (Quote)" },
      { id: "case-study-snapshot",  label: "Case Study Snapshot" },
      { id: "client-logos",         label: "Client Logos / Trusted By" },
      { id: "review-screenshot",    label: "Review Screenshot" },
    ],
  },
  {
    id: "competitive",
    label: "Competitive",
    templates: [
      { id: "comparison-us-vs-them",    label: "Comparison (Us vs Them)" },
      { id: "alternative-replacement",  label: "Alternative Replacement" },
      { id: "old-way-vs-new-way",       label: "Old Way vs New Way" },
    ],
  },
  {
    id: "audience-targeting",
    label: "Audience Targeting",
    templates: [
      { id: "niche-callout",             label: "Niche Callout" },
      { id: "role-based-callout",        label: "Role-Based Callout" },
      { id: "industry-specific-callout", label: "Industry-Specific Callout" },
    ],
  },
  {
    id: "educational",
    label: "Educational",
    templates: [
      { id: "how-it-works",          label: "How It Works (Steps)" },
      { id: "framework-method",      label: "Framework / Method" },
      { id: "tips-educational",      label: "Tips / Educational" },
      { id: "mistake-anti-pattern",  label: "Mistake / Anti-Pattern" },
    ],
  },
  {
    id: "offer-cta",
    label: "Offer & CTA",
    templates: [
      { id: "offer-discount",          label: "Offer / Discount" },
      { id: "free-trial",              label: "Free Trial" },
      { id: "limited-time-urgency",    label: "Limited Time / Urgency" },
      { id: "guarantee-risk-reversal", label: "Guarantee / Risk Reversal" },
    ],
  },
  {
    id: "visual-style",
    label: "Visual Style",
    templates: [
      { id: "visual-metaphor",      label: "Visual Metaphor" },
      { id: "icon-headline-minimal", label: "Icon + Headline Minimal" },
      { id: "illustration-based",   label: "Illustration-Based" },
      { id: "pattern-interrupt",    label: "Pattern Interrupt (Scroll Stopper)" },
    ],
  },
  {
    id: "native-text",
    label: "Native / Text",
    templates: [
      { id: "minimalist-text-ad",     label: "Minimalist Text Ad" },
      { id: "tweet-style",            label: "Tweet Style" },
      { id: "chat-screenshot-style",  label: "Chat Screenshot Style" },
      { id: "notification-style",     label: "Notification Style" },
    ],
  },
  {
    id: "metrics-benefits",
    label: "Metrics & Benefits",
    templates: [
      { id: "metric-comparison",    label: "Metric Comparison (X vs Y)" },
      { id: "pain-point-highlight", label: "Pain Point Highlight" },
      { id: "benefit-focused",      label: "Benefit-Focused" },
      { id: "outcome-focused",      label: "Outcome-Focused" },
    ],
  },
];
