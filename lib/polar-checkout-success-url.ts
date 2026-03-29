/**
 * Polar replaces `{CHECKOUT_ID}` in the query after a successful checkout.
 * Use the relative path for Better Auth checkout config and the absolute helper for SDK-created sessions.
 */
export const POLAR_CHECKOUT_SUCCESS_PATH =
  "/dashboard/thank-you?checkout_id={CHECKOUT_ID}";

export function getPolarCheckoutSuccessUrlAbsolute(): string {
  const base = (process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");
  return `${base}${POLAR_CHECKOUT_SUCCESS_PATH}`;
}
