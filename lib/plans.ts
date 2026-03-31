/** Public route for choosing a subscription plan (checkout). */
export const PLANS_PATH = "/plans";

/**
 * Builds `/plans?next=...` for post-checkout intent. Only allows same-origin paths
 * starting with `/` (no protocol or `//`).
 */
export function plansUrlWithReturn(returnTo: string): string {
  const trimmed = returnTo.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return PLANS_PATH;
  }
  return `${PLANS_PATH}?${new URLSearchParams({ next: trimmed }).toString()}`;
}
