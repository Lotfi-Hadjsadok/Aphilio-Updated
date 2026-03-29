export type TypographyEntry = {
  fontfamily: string;
  body: string;
  heading: string;
};

export type BrandingPersonality = {
  tone: string;
  energy: string;
  audience: string;
  voice: string;
  archetype: string;
  valueProposition: string;
  emotionalTriggers: string[];
  communicationStyle: string;
};

export type BrandingDNA = {
  /** Frequency-ranked brand colors from the page. */
  colors: { primary: string | null; secondary: string | null };
  favicon: string | null;
  logo: string | null;
  ogImage: string | null;
  /** Font families with body/heading weight per entry. */
  typography: TypographyEntry[] | null;
};

export type ScrapedSection = {
  /** Section heading or aria-label when present. */
  heading: string | null;
  content: string;
};

/** One scraped path under a site context. */
export type SubpageSnapshot = {
  path: string;
  title: string;
  scrapedUrl: string;
  markdown: string;
  sections: ScrapedSection[];
};

export type ScrapeResult = {
  id: string;
  baseUrl: string;
  name: string;
  scrapedUrl: string;
  markdown: string;
  sections: ScrapedSection[];
  branding: BrandingDNA | null;
  /** AI-derived personality specs. */
  personality: BrandingPersonality | null;
  /** AI-derived marketing angles (up to 40). */
  marketingAngles: string[] | null;
  createdAt: Date;
  /** Present when more than one path exists for this site. */
  subpages?: SubpageSnapshot[];
};

/** Library row for browsing saved contexts. */
export type SavedContextSummary = {
  id: string;
  baseUrl: string;
  name: string;
  /** Stored from scrape when available; UI may fall back by hostname when null. */
  favicon: string | null;
  createdAt: Date;
  subcontextCount: number;
};

export type ScrapeState = {
  error?: string;
  result?: ScrapeResult;
};

/** Server action state for opening a saved context from the library. */
export type LibraryLoadState = ScrapeState;

export type DeleteDNAState = {
  error?: string;
  deletedContextId?: string | null;
};

export type LoadSavedContextOutcome =
  | { ok: true; result: ScrapeResult }
  | { ok: false; error: string };
