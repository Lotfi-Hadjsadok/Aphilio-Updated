/** Long scraped page titles (e.g. "Acme — The … for X") read badly as a brand label; prefer hostname or a short lead. */
export function savedNameLooksLikePageTitle(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 40 || /\s[-–—]\s/.test(trimmed);
}

/** Pick card: use hostname as title when the saved name is a page title / tagline. */
export function dnaPickCardTitleAndSubtitle(
  savedName: string,
  hostname: string,
): { title: string; subtitle: string | null } {
  const useHostnameAsTitle = savedNameLooksLikePageTitle(savedName);
  if (useHostnameAsTitle) {
    return { title: hostname, subtitle: null };
  }
  return { title: savedName, subtitle: hostname };
}

/** History sidebar and similar: show a short label instead of full scraped titles. */
export function shortBrandLabelForUi(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  if (!savedNameLooksLikePageTitle(trimmed)) return trimmed;
  const beforeSeparator = trimmed.split(/\s[-–—]\s/)[0]?.trim();
  if (beforeSeparator && beforeSeparator.length > 0 && beforeSeparator.length < trimmed.length) {
    return beforeSeparator;
  }
  return trimmed.length > 36 ? `${trimmed.slice(0, 34)}…` : trimmed;
}
