/**
 * GA4 custom event names (snake_case, aphilio_ prefix).
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */
export const APHILIO_GA_EVENTS = {
  // Auth
  loginStart: "aphilio_login_start",

  // Brand DNA / scrape
  brandDnaScrapeStart: "aphilio_brand_dna_scrape_start",
  brandDnaScrapeComplete: "aphilio_brand_dna_scrape_complete",
  brandDnaScrapeError: "aphilio_brand_dna_scrape_error",
  brandDnaDelete: "aphilio_brand_dna_delete",

  // Chat image generation
  chatGenerationStart: "aphilio_chat_generation_start",
  chatGenerationComplete: "aphilio_chat_generation_complete",
  chatGenerationError: "aphilio_chat_generation_error",
  chatConversationDeleted: "aphilio_chat_conversation_deleted",

  // Ad creative studio funnel
  adStudioDnaLoadStart: "aphilio_ad_studio_dna_load_start",
  adStudioDnaLoaded: "aphilio_ad_studio_dna_loaded",
  adStudioDnaLoadError: "aphilio_ad_studio_dna_load_error",
  adStudioAnglesSubmitStart: "aphilio_ad_studio_angles_submit_start",
  adStudioAnglesSelected: "aphilio_ad_studio_angles_selected",
  adStudioAnglesError: "aphilio_ad_studio_angles_error",
  adStudioPromptsSubmitStart: "aphilio_ad_studio_prompts_submit_start",
  adStudioPromptsGenerated: "aphilio_ad_studio_prompts_generated",
  adStudioPromptsError: "aphilio_ad_studio_prompts_error",
  adStudioImageGenerationStart: "aphilio_ad_studio_image_generation_start",
  adStudioImageGenerationComplete: "aphilio_ad_studio_image_generation_complete",
  adStudioImageGenerationError: "aphilio_ad_studio_image_generation_error",

  // Library
  libraryCreativeDeleted: "aphilio_library_creative_deleted",
  libraryCreativeDownloadClick: "aphilio_library_creative_download_click",

  // Monetization
  checkoutClick: "aphilio_checkout_click",
  purchaseThankYouView: "aphilio_purchase_thank_you_view",

  // Onboarding funnel
  onboardingStepView: "aphilio_onboarding_step_view",
  onboardingScrapeComplete: "aphilio_onboarding_scrape_complete",
  onboardingScrapeError: "aphilio_onboarding_scrape_error",
} as const;

export type AphilioGaEventParams = Record<string, string | number | boolean>;
