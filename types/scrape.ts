export type BrandingPersonality = {
  tone: string;
  energy: string;
  audience: string;
};

export type BrandingDNA = {
  /** Frequency-ranked brand colors from the page. */
  colors: { primary: string | null; secondary: string | null };
  favicon: string | null;
  logo: string | null;
  ogImage: string | null;
  personality: BrandingPersonality;
  /** Frequency-ranked font families. */
  fonts: { primary: string | null; secondary: string | null };
  /** e.g. body vs heading weights from computed styles. */
  typography: string | null;
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
  createdAt: Date;
  /** Present when more than one path exists for this site. */
  subpages?: SubpageSnapshot[];
};

/** Library row for browsing saved contexts. */
export type SavedContextSummary = {
  id: string;
  baseUrl: string;
  name: string;
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
