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
  { value: "1:1", label: "Square", note: "Facebook · Instagram Feed", wClass: "w-8", hClass: "h-8" },
  { value: "4:5", label: "Portrait", note: "Instagram Feed", wClass: "w-7", hClass: "h-9" },
  { value: "9:16", label: "Story", note: "Reels · TikTok · Stories", wClass: "w-5", hClass: "h-9" },
  { value: "16:9", label: "Landscape", note: "YouTube · LinkedIn", wClass: "w-9", hClass: "h-5" },
];

export type AdTemplate = {
  id: string;
  label: string;
  /** Suggested ratio for this layout (feed portrait, story hook, banner, etc.). */
  defaultAspectRatio: AdAspectRatio;
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
      { id: "problem-pain", label: "Problem / Pain", defaultAspectRatio: "4:5" },
      { id: "problem-solution", label: "Problem → Solution", defaultAspectRatio: "4:5" },
      { id: "before-after", label: "Before / After", defaultAspectRatio: "1:1" },
      { id: "bold-claim", label: "Bold Claim / Hook", defaultAspectRatio: "9:16" },
      { id: "results-numbers", label: "Results / Numbers", defaultAspectRatio: "1:1" },
    ],
  },
  {
    id: "product-feature",
    label: "Product & Feature",
    templates: [
      { id: "product-ui-showcase", label: "Product UI Showcase", defaultAspectRatio: "4:5" },
      { id: "feature-highlight", label: "Feature Highlight", defaultAspectRatio: "4:5" },
      { id: "feature-grid", label: "Feature Grid", defaultAspectRatio: "1:1" },
      { id: "demo-snapshot", label: "Demo Snapshot (UI Step)", defaultAspectRatio: "1:1" },
    ],
  },
  {
    id: "social-proof",
    label: "Social Proof",
    templates: [
      { id: "testimonial-quote", label: "Testimonial (Quote)", defaultAspectRatio: "4:5" },
      { id: "case-study-snapshot", label: "Case Study Snapshot", defaultAspectRatio: "4:5" },
      { id: "client-logos", label: "Client Logos / Trusted By", defaultAspectRatio: "16:9" },
      { id: "review-screenshot", label: "Review Screenshot", defaultAspectRatio: "4:5" },
    ],
  },
  {
    id: "competitive",
    label: "Competitive",
    templates: [
      { id: "comparison-us-vs-them", label: "Comparison (Us vs Them)", defaultAspectRatio: "1:1" },
      { id: "alternative-replacement", label: "Alternative Replacement", defaultAspectRatio: "4:5" },
      { id: "old-way-vs-new-way", label: "Old Way vs New Way", defaultAspectRatio: "1:1" },
    ],
  },
  {
    id: "audience-targeting",
    label: "Audience Targeting",
    templates: [
      { id: "niche-callout", label: "Niche Callout", defaultAspectRatio: "9:16" },
      { id: "role-based-callout", label: "Role-Based Callout", defaultAspectRatio: "4:5" },
      { id: "industry-specific-callout", label: "Industry-Specific Callout", defaultAspectRatio: "4:5" },
    ],
  },
  {
    id: "educational",
    label: "Educational",
    templates: [
      { id: "how-it-works", label: "How It Works (Steps)", defaultAspectRatio: "4:5" },
      { id: "framework-method", label: "Framework / Method", defaultAspectRatio: "1:1" },
      { id: "tips-educational", label: "Tips / Educational", defaultAspectRatio: "4:5" },
      { id: "mistake-anti-pattern", label: "Mistake / Anti-Pattern", defaultAspectRatio: "4:5" },
    ],
  },
  {
    id: "offer-cta",
    label: "Offer & CTA",
    templates: [
      { id: "offer-discount", label: "Offer / Discount", defaultAspectRatio: "4:5" },
      { id: "free-trial", label: "Free Trial", defaultAspectRatio: "4:5" },
      { id: "limited-time-urgency", label: "Limited Time / Urgency", defaultAspectRatio: "9:16" },
      { id: "guarantee-risk-reversal", label: "Guarantee / Risk Reversal", defaultAspectRatio: "4:5" },
    ],
  },
  {
    id: "visual-style",
    label: "Visual Style",
    templates: [
      { id: "visual-metaphor", label: "Visual Metaphor", defaultAspectRatio: "1:1" },
      { id: "icon-headline-minimal", label: "Icon + Headline Minimal", defaultAspectRatio: "1:1" },
      { id: "illustration-based", label: "Illustration-Based", defaultAspectRatio: "4:5" },
      { id: "pattern-interrupt", label: "Pattern Interrupt (Scroll Stopper)", defaultAspectRatio: "9:16" },
    ],
  },
  {
    id: "native-text",
    label: "Native / Text",
    templates: [
      { id: "minimalist-text-ad", label: "Minimalist Text Ad", defaultAspectRatio: "1:1" },
      { id: "tweet-style", label: "Tweet Style", defaultAspectRatio: "16:9" },
      { id: "chat-screenshot-style", label: "Chat Screenshot Style", defaultAspectRatio: "9:16" },
      { id: "notification-style", label: "Notification Style", defaultAspectRatio: "9:16" },
    ],
  },
  {
    id: "metrics-benefits",
    label: "Metrics & Benefits",
    templates: [
      { id: "metric-comparison", label: "Metric Comparison (X vs Y)", defaultAspectRatio: "1:1" },
      { id: "pain-point-highlight", label: "Pain Point Highlight", defaultAspectRatio: "4:5" },
      { id: "benefit-focused", label: "Benefit-Focused", defaultAspectRatio: "4:5" },
      { id: "outcome-focused", label: "Outcome-Focused", defaultAspectRatio: "4:5" },
    ],
  },
];

const defaultRatioByTemplateId: Map<string, AdAspectRatio> = new Map(
  AD_TEMPLATE_CATEGORIES.flatMap((category) =>
    category.templates.map((template) => [template.id, template.defaultAspectRatio] as const),
  ),
);

export function defaultAspectRatioForTemplate(templateId: string): AdAspectRatio {
  return defaultRatioByTemplateId.get(templateId) ?? "4:5";
}
