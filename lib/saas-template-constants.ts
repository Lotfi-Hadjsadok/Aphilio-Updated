export type SaaSTemplateDefinition = {
  prompt: string;
  description: string;
  needs: string[];
  default_aspect_ratio: "1:1" | "4:5" | "9:16" | "16:9";
};

export const saasTemplateConstants: SaaSTemplateDefinition[] = [
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact UI colors, typography style, and brand tone precisely. Create: a static ad with a [BACKGROUND like deep navy / off-white / muted gray] background. Top third: large bold sans-serif headline reading \"[YOUR HEADLINE, under 10 words — e.g. Stop wasting hours on manual work.]\". Below in smaller text: \"[YOUR SUBHEAD, one sentence — e.g. [BRAND] automates what slows you down.]\". Bottom half: a browser or device mockup centered on the surface showing a clean [DASHBOARD / FEATURE SCREEN] with [KEY UI DETAIL like an analytics graph / AI output panel / workflow builder]. Shot from a slight overhead 3/4 angle, subtle drop shadow. [BRAND] logo bottom right. Clean, authoritative. 4:5 aspect ratio.",
    description: "Headline template for text-first SaaS creative testing.",
    needs: ["BACKGROUND", "YOUR_HEADLINE", "YOUR_SUBHEAD_ONE_SENTENCE", "DASHBOARD_OR_FEATURE_SCREEN", "KEY_UI_DETAIL", "BRAND"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match exact brand colors and typography style. Create: a promotional ad with a split background. Top 60% is [PRIMARY BRAND COLOR like deep indigo] and bottom 40% is [CONTRAST COLOR like soft white]. A laptop or phone mockup sits centered where the colors meet, screen showing the [BRAND] dashboard with [KEY SCREEN DETAIL like an AI-generated output or analytics overview]. Upper area: large [CONTRAST TEXT] sans-serif reading \"[YOUR OFFER like START FREE FOR 14 DAYS]\". Below: \"[OFFER DETAILS like No credit card required · Cancel anytime]\". Lower section: small [BRAND COLOR] text listing [VALUE ADDS like Unlimited projects / Priority support / Full feature access]. [BRAND] logo bottom right. 9:16 aspect ratio.",
    description: "Free Trial / Offer",
    needs: ["PRIMARY_BRAND_COLOR", "CONTRAST_COLOR", "BRAND", "KEY_SCREEN_DETAIL", "CONTRAST_TEXT", "YOUR_OFFER", "OFFER_DETAILS", "BRAND_COLOR", "VALUE_ADDS"],
    default_aspect_ratio: "9:16",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a testimonial ad set in [SETTING like a bright home office / modern coworking space] with warm natural light. A laptop or tablet with the [BRAND] interface visible on screen sits slightly out of focus in the background. Overlaid: large bold white sans-serif \"[SHORT HEADLINE like Finally, a tool that does what it promises.]\". Below: \"[FULL QUOTE, 2-3 sentences describing a specific workflow win or time saved]. [NAME], [TITLE & COMPANY].\" Five filled [BRAND COLOR] stars. [BRAND] logo bottom right in white. Shot on 35mm f/2.0. 9:16 aspect ratio.",
    description: "Customer Testimonial",
    needs: ["SETTING", "BRAND", "SHORT_HEADLINE", "FULL_QUOTE_2_3_SENTENCES_DESCRIBING_A_SPECIFIC_WORKFLOW_WIN_OR_TIME_SAVED", "NAME", "TITLE_AND_COMPANY", "BRAND_COLOR"],
    default_aspect_ratio: "9:16",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: an educational diagram-style ad on white background. Top: bold [BRAND COLOR] text \"[HEADER like What Makes [BRAND] Different]\". Below: a clean browser-framed or borderless screenshot of the [BRAND] [FEATURE SCREEN like AI generation panel / analytics dashboard / workflow builder] centered, even light. Four callout boxes with connecting lines pointing to specific UI elements: \"[FEATURE 1-4 like One-click AI output / Real-time collaboration / Auto-formatting / Brand memory]\". Each has a small [BRAND COLOR] circle. \"[WEBSITE URL]\" bottom center. [BRAND] logo bottom right. Feels like a product teardown by a top design agency. 4:5 aspect ratio.",
    description: "Features / Benefits Point-Out",
    needs: ["BRAND_COLOR", "HEADER", "BRAND", "FEATURE_SCREEN", "FEATURE_1_4", "WEBSITE_URL"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a benefit-list ad, split composition on [BACKGROUND like soft gray / warm white] background. Left 40%: a device mockup (MacBook or iPhone) showing the [BRAND] UI on [FEATURE SCREEN], shot at a slight angle with soft drop shadow. Right 60%: vertical stack of five lines with filled [BRAND COLOR] circles: \"[BENEFIT 1-5 like Saves 10+ hours per week / Connects to your existing tools / Works in any language / No design skills needed / Scales with your team]\". Clean sans-serif, generous spacing. [BRAND] logo bottom right. 4:5 aspect ratio.",
    description: "Bullet-Point Feature List",
    needs: ["BACKGROUND", "BRAND", "FEATURE_SCREEN", "BRAND_COLOR", "BENEFIT_1_5"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a social proof ad on [BACKGROUND like warm white]. Top: \"[HEADLINE like Join 50,000+ Teams Using [BRAND]]\" in bold [BRAND COLOR]. Five filled stars with \"Rated [X] out of 5 on [PLATFORM like G2 / Capterra / Product Hunt]\". Center: a laptop or device mockup showing the [BRAND] main dashboard. Below: frosted white card with five-star rating, \"[REVIEW TITLE like Game-changer for our marketing team]\", \"[2-3 SENTENCE REVIEW]\", \"[ATTRIBUTION like Head of Growth @ Company]\" in italic. Below card: \"As Seen On\" with five grayscale press or integration logos. [BRAND] logo bottom right. 4:5 aspect ratio.",
    description: "Social Proof",
    needs: ["BACKGROUND", "HEADLINE", "BRAND_COLOR", "RATING_VALUE", "PLATFORM", "BRAND", "REVIEW_TITLE", "2_3_SENTENCE_REVIEW", "ATTRIBUTION"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a side-by-side ad divided vertically. Left: muted gray background. Right: [PRIMARY BRAND COLOR]. Center top: white circle with \"VS\". Left header: \"[COMPETITOR CATEGORY like Manual workflows / Old-school tools]\" + generic cluttered screenshot + list with X marks: \"[WEAKNESS 1-5 like Hours of manual setup / No AI assistance / No collaboration / Expensive add-ons / Steep learning curve]\". Right header: \"[YOUR BRAND]\" + clean [BRAND] UI screenshot + list with checkmarks: \"[STRENGTH 1-5 like Live in minutes / AI-powered outputs / Real-time team sync / All-inclusive pricing / Intuitive by design]\". [BRAND] logo bottom right. 4:5 aspect ratio.",
    description: "Us vs Them",
    needs: ["PRIMARY_BRAND_COLOR", "COMPETITOR_CATEGORY", "WEAKNESS_1_5", "YOUR_BRAND", "BRAND", "STRENGTH_1_5"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference for UI colors ONLY. This should feel like a real user's screen-share post. Create: a split TikTok-style before-and-after. LEFT: a chaotic screen with [BEFORE STATE like a cluttered spreadsheet / overflowing email inbox / messy Notion doc], framed as a grainy iPhone screenshot, overlaid with white handwritten text: \"[BEFORE DATE or LABEL like Before [BRAND]]\". RIGHT: the same screen replaced by the clean [BRAND] interface showing [AFTER STATE like a polished AI output / organized dashboard / automated workflow], bright and crisp, [BRAND] UI visible. White text: \"[AFTER DATE or RESULT like After 1 week on [BRAND]]\". Top center: \"[TIMEFRAME like 7 Days with [BRAND]]\" with emoji. Should look stitched in CapCut. 9:16 aspect ratio.",
    description: "Before & After (Workflow Transformation)",
    needs: ["BEFORE_STATE", "BEFORE_DATE_OR_LABEL", "BRAND", "AFTER_STATE", "AFTER_DATE_OR_RESULT", "TIMEFRAME"],
    default_aspect_ratio: "9:16",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: Background is a blurred close-up of the [BRAND] UI dashboard, slightly out of focus. Center: white rounded-rectangle review card (G2 or Capterra style). Gray user icon, \"[NAME]\", one gold star + four gray, \"[VERIFIED USER]\" badge, bold text: \"[BAIT that sounds negative but is positive — e.g. 'This ruined every other tool for me.']\". Bottom: bold white sans-serif \"[PUNCHLINE like THE REVIEWS ARE IN.]\". [BRAND] logo bottom right. 4:5 aspect ratio.",
    description: "Negative Marketing (Bait & Switch)",
    needs: ["BRAND", "NAME", "VERIFIED_USER", "BAIT_THAT_SOUNDS_NEGATIVE_BUT_IS_POSITIVE", "PUNCHLINE"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a press ad on off-white linen background. Top: \"As Featured In\" in small [BRAND COLOR] uppercase wide-tracked text. Below: five grayscale publication logos (tech / business media). Center: italic serif pull-quote in [BRAND COLOR]: \"[PRESS QUOTE like '[BRAND] is quietly becoming the go-to AI tool for growth teams.']\" with attribution. Lower third: a clean device mockup showing the [BRAND] main interface, soft side light, slightly angled. [BRAND] logo bottom left. Generous white space. Full-page Wired / TechCrunch energy. 4:5 aspect ratio.",
    description: "Press / Editorial",
    needs: ["BRAND_COLOR", "PRESS_QUOTE", "BRAND"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact UI colors and brand tone precisely. Create: a review-driven ad with a solid [BRAND COLOR with hex — a soft, muted tone works best] color block background. Top half: large bold italic serif text in white with curly quotation marks: \"[PULL-QUOTE — the most emotional 4-8 word phrase, e.g. 'I finally have my Mondays back!']\". Directly below the quote: five large filled gold star icons. Bottom left, overlapping the color background: a white rounded-corner review card with subtle shadow, containing: small gray circular avatar icon, \"[FIRST NAME + LAST INITIAL]\" in bold dark sans-serif with \"[JOB TITLE — e.g. Marketing Manager]\", blue checkmark with \"[VERIFIED USER]\" in small blue text. Review body in medium-weight dark sans-serif, 4-6 lines of authentic customer voice, trailing off: \"...Read more\" in bold [BRAND COLOR]. \"Was this review helpful? 👍 [COUNT]\" below. Bottom right, overlapping the card: a device mockup (phone or MacBook) showing the [BRAND] key feature screen at a slight angle. 1:1 or 4:5 aspect ratio.",
    description: "Pull-Quote Review Card",
    needs: ["BRAND_COLOR_WITH_HEX_A_SOFT_MUTED_TONE_WORKS_BEST", "PULL_QUOTE_THE_MOST_EMOTIONAL_4_8_WORD_PHRASE_E_G_I_FINALLY_HAVE_MY_MONDAYS_BACK", "FIRST_NAME_LAST_INITIAL", "JOB_TITLE", "VERIFIED_USER", "BRAND_COLOR", "COUNT", "BRAND"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact UI design and typography style precisely. Create: a static ad on a white-to-[LIGHT GRADIENT like cool gray-blue] gradient background. Top: large bold [TEXT COLOR like dark gray] sans-serif headline: \"[HEADLINE like The only platform your team will actually use.]\" Center: a large, crisp [BRAND] dashboard screenshot in a browser frame or borderless, soft drop shadow. Flanking the dashboard on both sides: four stat callouts with curved arrows pointing toward the screen. Left side top: \"[STAT 1 like 10x]\" oversized bold + \"[LABEL like Faster Output]\". Left bottom: \"[STAT 2 like 94%]\" + \"[LABEL like User Retention]\". Right top: \"[STAT 3 like 50K+]\" + \"[LABEL like Active Teams]\". Right bottom: \"[STAT 4 like 4.9★]\" + \"[LABEL like Avg. Rating]\" + five gold stars. Arrows are hand-drawn-style in [BRAND COLOR]. No brand logo—dashboard branding is visible in the screenshot. 1:1 aspect ratio.",
    description: "Dashboard Hero + Stat Callouts",
    needs: ["LIGHT_GRADIENT", "TEXT_COLOR", "HEADLINE", "BRAND", "STAT_1", "LABEL", "STAT_2", "STAT_3", "STAT_4", "BRAND_COLOR"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact brand colors and typography precisely. Create: a static ad on a [BACKGROUND like soft gradient from brand color to white] background. Top: oversized bold white all-caps sans-serif headline: \"[HEADLINE like EVERYTHING YOUR TEAM NEEDS. ONE PLAN.]\". Below: a horizontal [ACCENT COLOR] banner divided into [NUMBER like five] equal segments, each with a two-word benefit label in white text: \"[BENEFIT 1 like AI Outputs]\", \"[BENEFIT 2 like Team Sync]\", \"[BENEFIT 3 like Brand Memory]\", \"[BENEFIT 4 like Auto Reports]\", \"[BENEFIT 5 like Priority Support]\". Center-to-bottom: a stylized pricing card or plan overview screenshot angled slightly, showing plan name, price, and feature list. Lower foreground: a [PERSON DETAIL like woman's hand on a MacBook keyboard] entering from the bottom edge. [BRAND] logo bottom left corner. Bright, energetic. 1:1 aspect ratio.",
    description: "Plan / Pricing Showcase + Benefit Bar",
    needs: ["BACKGROUND", "HEADLINE", "ACCENT_COLOR", "NUMBER", "BENEFIT_1", "BENEFIT_2", "BENEFIT_3", "BENEFIT_4", "BENEFIT_5", "PERSON_DETAIL", "BRAND"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a static ad on a clean white background. Top: oversized bold black sans-serif headline: \"[HOOK HEADLINE like IF YOU'RE STILL DOING THIS MANUALLY...]\" with [EMOJI] at the end. Center: a social comment card with light gray rounded-rectangle background (Twitter/X or LinkedIn style) containing: a small circular profile avatar, bold name \"[REVIEWER NAME]\", and a multi-sentence comment in regular-weight sans-serif: \"[FULL COMMENT, 3-4 sentences, conversational, describing a workflow win with [BRAND]]\". Small gray timestamp \"[TIMESTAMP like 2d]\". Bottom center: a device mockup showing the [BRAND] relevant feature screen, clean studio lighting. No brand logo overlay. The rawness is the point. 1:1 aspect ratio.",
    description: "Social Comment Screenshot + UI",
    needs: ["HOOK_HEADLINE", "EMOJI", "REVIEWER_NAME", "FULL_COMMENT_3_4_SENTENCES_CONVERSATIONAL_DESCRIBING_A_WORKFLOW_WIN_WITH_BRAND", "TIMESTAMP", "BRAND"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a static ad on a clean white background. Top center: large [ACCENT COLOR] opening quotation marks. Below: mixed-weight headline — the first line in italic semi-bold reading \"[SETUP LINE like I've been]\", the next two lines in enormous bold all-caps: \"[BAIT PHRASE like CHEATING ON MY / ENTIRE STACK]\", followed by a smaller sentence-case line: \"[REVEAL like with [BRAND] — and I'm not going back]\". Closing quotation marks and \"[ATTRIBUTION like - Leila D., Founder]\". Left side bottom third: a phone or MacBook mockup with the [BRAND] screen at a slight angle. To the left: a trust badge (circular seal reading \"[RATING like 4.9 Stars on G2]\"). Right side bottom: \"[REVIEW COUNT like 2,800+] Verified Reviews\" with five [ACCENT COLOR] stars. Bottom edge: small disclaimer \"[DISCLAIMER like Individual results may vary]\". 1:1 aspect ratio.",
    description: "Curiosity Gap / Hook Quote Testimonial",
    needs: ["ACCENT_COLOR", "SETUP_LINE", "BAIT_PHRASE", "REVEAL", "ATTRIBUTION", "BRAND", "RATING", "REVIEW_COUNT", "DISCLAIMER"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a static ad on a solid [BRAND COLOR like deep indigo] background. Top: large bold white pull-quote: \"[HEADLINE QUOTE like 'We cut our reporting time from 3 days to 30 minutes.']\". Below: five filled gold stars. Center-left: a white rounded-rectangle review card with shadow containing: gray circular avatar, bold name \"[REVIEWER NAME]\" + \"[COMPANY ROLE like VP of Marketing]\", blue checkmark + \"[VERIFIED USER]\" text, 3-4 sentence review body in regular weight. At the bottom of the card: \"[...Read more]\" and \"Was this review helpful? 👍 [COUNT]\". Right side, overlapping the card: a MacBook or phone mockup showing the [BRAND] key screen, soft studio lighting. No brand logo — the review card is the trust mechanic. 1:1 aspect ratio.",
    description: "Verified Review Card (G2 / Capterra Style)",
    needs: ["BRAND_COLOR", "HEADLINE_QUOTE", "REVIEWER_NAME", "COMPANY_ROLE", "VERIFIED_USER", "READ_MORE", "COUNT", "BRAND"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a static ad on a white background with a lifestyle workspace arrangement. Top: bold [ACCENT COLOR] filled banner spanning full width, white all-caps sans-serif: \"[HEADLINE like CUT YOUR WORKFLOW TIME IN HALF — GUARANTEED]\". Center: a [PERSON DETAIL like woman's hand] holding a phone showing the [BRAND] app screen, or a laptop open to the dashboard. Scattered around the edges: [LIFESTYLE PROPS like coffee cup, notebook, wireless keyboard, plant] arranged organically, slightly out of focus. Four stat callouts with curved [ACCENT COLOR] arrows pointing toward the device: \"[STAT 1 like 10x] / [LABEL like Output Speed]\", \"[STAT 2 like 50K] / [LABEL like Active Users]\", \"[STAT 3 like 4.9★] / [LABEL like Avg. Rating]\", \"[STAT 4 like 30K] / [LABEL like 5-Star Reviews]\" with five small gold stars. Stats bold, labels all-caps regular. Bright, clean, information-dense but scannable. 1:1 aspect ratio.",
    description: "Stat Callout Lifestyle (Data-Driven Workspace)",
    needs: ["ACCENT_COLOR", "HEADLINE", "PERSON_DETAIL", "BRAND", "LIFESTYLE_PROPS", "STAT_1", "LABEL", "STAT_2", "STAT_3", "STAT_4"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a static ad on a clean white background. Top left: circular headshot of [PERSON DESCRIPTION like smiling man, late 30s, business casual]. To the right: bold name \"[REVIEWER NAME]\" + \"[TITLE like Growth Lead at Company]\" + [VERIFIED ICON like blue checkmark]. Below: a long-form customer quote in large regular-weight black sans-serif: \"[FULL QUOTE, 3-5 sentences describing a specific, measurable improvement]\". Key phrases highlighted with [HIGHLIGHT COLOR like bright lime / neon yellow] rectangular fills behind the text: \"[HIGHLIGHTED PHRASE 1 like saved 12 hours a week]\", \"[HIGHLIGHTED PHRASE 2 like This is the best tool we've ever used.]\". Bottom right: a device mockup at a slight angle, partially cropped. To the left: a circular trust badge \"[e.g. 100% MONEY BACK / 30 DAYS]\" in [BADGE COLOR]. [BRAND] logo bottom left, small. 1:1 aspect ratio.",
    description: "Highlighted / Annotated Testimonial",
    needs: ["PERSON_DESCRIPTION", "REVIEWER_NAME", "TITLE", "VERIFIED_ICON", "FULL_QUOTE_3_5_SENTENCES_DESCRIBING_A_SPECIFIC_MEASURABLE_IMPROVEMENT", "HIGHLIGHT_COLOR", "HIGHLIGHTED_PHRASE_1", "HIGHLIGHTED_PHRASE_2", "E_G_100_MONEY_BACK_OR_30_DAYS", "BADGE_COLOR", "BRAND"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots for tone ONLY. Do NOT use polished ad layouts. This should look like organic editorial content. Create: a full-bleed moody editorial photo of [PERSON DESCRIPTION like a focused professional at a minimal desk, warm lamp glow, dark background], shot on 50mm f/1.8, cinematic grade, warm highlights, cool shadows. Lower 45%: text overlay zone: a white rounded-rectangle pill label reading \"[CATEGORY TAG like TRENDING IN TECH]\". Below: very large bold all-caps condensed white headline filling the frame width with key words in [HIGHLIGHT COLOR]: \"[HEADLINE like [BRAND] IS THE AI TOOL REPLACING ENTIRE MARKETING TEAMS — HERE'S WHY]\". At least 35% of total frame height. Bottom center: \"[@HANDLE]\" in small white text. No product shot, no CTA button, no stars. Should read like a tech media post. 4:5 aspect ratio.",
    description: "Advertorial / Editorial Content Card",
    needs: ["PERSON_DESCRIPTION", "CATEGORY_TAG", "HIGHLIGHT_COLOR", "HEADLINE", "BRAND", "HANDLE"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a static ad on a vibrant [GRADIENT like deep indigo to electric violet] gradient background, flowing diagonally. Upper left: oversized playful bold white headline: \"[BOLD STATEMENT like This AI just replaced your entire content team.]\" — loose, fun, expressive, not corporate. Right side: a [PERSON DETAIL like hand reaching from upper right] on a MacBook trackpad, screen showing the [BRAND] dashboard with a live AI output visible. Bottom left: [BRAND] logo in white with \"[TAGLINE like Your AI-powered growth platform]\" below. No stats, no reviews, no badges. 1:1 aspect ratio.",
    description: "Bold Statement / Reaction Headline",
    needs: ["GRADIENT", "BOLD_STATEMENT", "PERSON_DETAIL", "BRAND", "TAGLINE"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a result-visualization ad. Full background is a photorealistic photo of [OUTCOME SCENE like a relaxed professional sipping coffee, feet up, minimal desk]. Shot at 50mm f/2.8, warm light, shallow depth of field. Top third: large bold white sans-serif: \"[HEADLINE like A platform that gives you back 15 hours every week]\" with one key word in bold italic for emphasis. A device mockup (phone propped on desk) showing the [BRAND] key output screen placed bottom-right, angled casually into the scene. Bottom: semi-transparent white bar spanning full width with three stat columns: \"[STAT 1 like 15 HRS SAVED/WEEK]\" | \"[STAT 2 like 10× OUTPUT]\" | \"[STAT 3 like ROI IN 30 DAYS]\". Very bottom: bold sans-serif \"[CLEAN CLAIM like NO LEARNING CURVE. NO CONTRACTS.]\". The lifestyle is the hero — the product is the payoff. 1:1 aspect ratio.",
    description: "ROI Story / \"Saved X Hours\"",
    needs: ["OUTCOME_SCENE", "HEADLINE", "BRAND", "STAT_1", "STAT_2", "STAT_3", "CLEAN_CLAIM"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match exact brand typography style and tone. Create: a copy-dominant manifesto ad on a clean white background. No background imagery. Top: oversized bold black headline: \"[PROVOCATIVE HEADLINE like We didn't build another SaaS tool.]\" spanning the top 15%. Below: left-aligned body copy in smaller regular-weight black text, structured as short punchy sentences and line breaks (NOT paragraphs), building a persuasive argument about [CORE BRAND TENSION like why the simplest tools win / why AI should remove friction not add it / why teams shouldn't need training]. The copy flows through: acknowledging the status quo, listing what teams lose without this approach, reframing as a positive, closing with a confident brand statement. Approximately [12-18 LINES] of copy. Bottom 20%: a clean [BRAND] dashboard screenshot, centered, product-only on white. No icons, no badges, no CTA button. 1:1 aspect ratio.",
    description: "Long-Form Manifesto / Letter Ad",
    needs: ["PROVOCATIVE_HEADLINE", "CORE_BRAND_TENSION", "12_18_LINES", "BRAND"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a social proof ad. Top 55%: [BRAND] main interface screenshot or device mockup centered on a clean white background, studio-lit, soft shadow. A notification badge or live result detail slightly prominent. Bottom 45%: a realistic LinkedIn or Facebook-style comment card. Left: small circular profile photo of [PERSON DESCRIPTION like a woman in her 40s, professional headshot]. Bold name \"[FIRST NAME + LAST INITIAL]\" + \"[TITLE like Marketing Director]\" above the comment. Comment text: \"[TESTIMONIAL, 2-3 sentences touching on a specific problem and how [BRAND] solved it]\". \"[TIMEFRAME like 3w]\" · Like · Reply in gray. Bottom right: reaction emojis (thumbs up + heart) with \"[COUNT like 47]\". Should look like an organic screenshot. 1:1 aspect ratio.",
    description: "Product + Comment Callout (Faux Social Proof)",
    needs: ["BRAND", "PERSON_DESCRIPTION", "FIRST_NAME_LAST_INITIAL", "TITLE", "TESTIMONIAL_2_3_SENTENCES_TOUCHING_ON_A_SPECIFIC_PROBLEM_AND_HOW_BRAND", "TIMEFRAME", "COUNT"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a side-by-side comparison ad, divided vertically into two equal halves. Left half: [PRIMARY BRAND COLOR like deep violet] background. Clean [BRAND] dashboard screenshot, crisp and polished, showing [KEY FEATURE SCREEN]. Brand logo in bold white upper-left. Below: vertical stack of 4 benefits, each with a green checkmark: \"[STRENGTH 1-4 like AI-powered in minutes / Unlimited team seats / Works with your stack / Cancel anytime]\" in bold white uppercase. Right half: [CONTRAST COLOR like pale gray] background. A generic cluttered competitor UI screenshot. Header: \"[COMPETITOR CATEGORY like Legacy Alternatives]\". Below: 4 weaknesses with red X marks: \"[WEAKNESS 1-4 like Weeks of onboarding / Per-seat pricing / Manual-only workflows / Annual lock-in]\" in bold dark uppercase. Center divider: \"VS\" burst graphic in [ACCENT COLOR]. 1:1 aspect ratio.",
    description: "Us vs Them Color Split",
    needs: ["PRIMARY_BRAND_COLOR", "BRAND", "KEY_FEATURE_SCREEN", "STRENGTH_1_4", "CONTRAST_COLOR", "COMPETITOR_CATEGORY", "WEAKNESS_1_4", "ACCENT_COLOR"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Top 50%: lifestyle workspace photo — [SCENE like a team looking at a monitor together / person smiling at a laptop screen] in [MOOD like bright, modern, candid]. [BRAND] interface visible on screen. Middle: brand logo centered with thin horizontal rules as a visual divider. Bottom 50%: dark gradient overlay fading to [DARK COLOR like deep navy]. Large bold uppercase sans-serif: \"[STAT-DRIVEN HEADLINE like AFTER SWITCHING TO [BRAND], [X]% OF TEAMS REDUCED THEIR REPORTING TIME BY [Y]%].\" Key results highlighted in [ACCENT COLOR]. The statistic IS the headline — no subhead needed. 4:5 aspect ratio.",
    description: "Stat Callout (Data-Driven Lifestyle)",
    needs: ["SCENE", "MOOD", "BRAND", "DARK_COLOR", "STAT_DRIVEN_HEADLINE", "TEAMS_PERCENT", "REPORTING_TIME_REDUCTION_PERCENT", "ACCENT_COLOR"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: an information-dense feature ad, split composition. Left 45%: a device mockup or borderless screenshot showing [BRAND]'s [FEATURE SCREEN like the AI output builder / analytics view / workflow editor], clean white surface. Right 55%: white background. Top: [STAR RATING like five gold stars] + \"[REVIEW COUNT like 8,000+ REVIEWS]\" in [BRAND COLOR]. Brand logo. Below: [BRAND COLOR] serif headline: \"[HEADLINE like Built for teams that move fast]\". Then 3 checkmark benefit rows, each with a filled [BRAND COLOR] circle checkmark + bold text: \"[BENEFIT 1-3 like Works in your timezone / No training needed / Integrates in one click]\". Bottom right: large rounded [ACCENT COLOR] CTA button: \"[CTA like START FREE TODAY]\". 1:1 aspect ratio.",
    description: "Feature Checklist Showcase (Split UI + Info)",
    needs: ["BRAND", "FEATURE_SCREEN", "STAR_RATING", "REVIEW_COUNT", "BRAND_COLOR", "HEADLINE", "BENEFIT_1_3", "ACCENT_COLOR", "CTA"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a UI annotation ad on a [BACKGROUND like soft warm cream] background. Top: italic serif headline \"[BENEFIT STATEMENT like Everything you need. Nothing you don't.]\" in [BRAND COLOR like dark navy]. Below in massive bold sans-serif: \"[VALUE PROP like ALL IN ONE PLATFORM]\". Center: a [PERSON'S HAND] on a keyboard or trackpad with a large [BRAND] dashboard screenshot overlaid or shown on a laptop screen. Four curved arrows in [BRAND COLOR] pointing from specific UI elements to callout labels: \"[CALLOUT 1-4 like One-click AI output / Team collaboration mode / Brand voice memory / Real-time analytics]\". Arrows feel hand-drawn or editorial. Bottom: full-width [CONTRAST COLOR like deep navy] banner with [PROMO TEXT like LAUNCH OFFER — 40% OFF FIRST 3 MONTHS] in bold [ACCENT COLOR like gold/white]. 1:1 aspect ratio.",
    description: "Feature Arrow Callout / UI Annotation",
    needs: ["BACKGROUND", "BENEFIT_STATEMENT", "BRAND_COLOR", "VALUE_PROP", "PERSON_S_HAND", "BRAND", "CALLOUT_1_4", "CONTRAST_COLOR", "PROMO_TEXT", "ACCENT_COLOR"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots for brand colors ONLY. Do NOT use ad layouts. This should look completely organic. Create: a casual photo of [PERSON like a mid-30s professional in a hoodie] doing something mundane [ACTION like scrolling on a phone at a coffee shop / typing at a coworking space]. iPhone front camera, slightly grainy, ambient café or office lighting. Overlaid in the center: a realistic screenshot of a [PLATFORM like Reddit / X / Twitter] post. [POST DETAILS like subreddit name / username / timestamp / upvote count]. Post title in bold: \"[PROVOCATIVE OPINION HEADLINE related to the product's problem space — e.g. 'I will never go back to manual reporting after using AI']\". Post body: \"[2-3 sentences expanding on the opinion]\". No product visible. No brand logo. No CTA. The hook is the opinion. 9:16 aspect ratio.",
    description: "UGC + Viral Post Overlay",
    needs: ["PERSON", "ACTION", "PLATFORM", "POST_DETAILS", "PROVOCATIVE_OPINION_HEADLINE_RELATED_TO_THE_PRODUCT_S_PROBLEM_SPACE", "2_3_SENTENCES_EXPANDING_ON_THE_OPINION"],
    default_aspect_ratio: "9:16",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a bold statement ad. Top 15%: white banner with massive bold [BRAND COLOR like deep purple] uppercase headline: \"[2-3 WORD POWER STATEMENT like WORKFLOW KILLER.]\" with a period. Middle 55%: lifestyle product photo — [SCENE like a person's hand opening a laptop, [BRAND] dashboard appearing on screen, clean bright desk surface]. UI and branding clearly visible. Bottom 25%: [SOFT BRAND COLOR like lavender] background. Three evenly spaced icon-and-text columns: [ICON 1 + LABEL like (lightning bolt) INSTANT OUTPUT] | [ICON 2 + LABEL like (team icon) BUILT FOR TEAMS] | [ICON 3 + LABEL like (chart icon) MEASURABLE ROI]. Icons are simple line-drawn in [BRAND COLOR] circles. Very bottom: scrolling ticker bar in [DARK BRAND COLOR]: \"[SOCIAL PROOF like TRUSTED BY 50,000+ TEAMS WORLDWIDE]\". 1:1 aspect ratio.",
    description: "Hero Statement + Icon Benefit Bar",
    needs: ["BRAND_COLOR", "2_3_WORD_POWER_STATEMENT", "SCENE", "SOFT_BRAND_COLOR", "ICON_1_LABEL", "ICON_2_LABEL", "ICON_3_LABEL", "DARK_BRAND_COLOR", "SOCIAL_PROOF"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a structured comparison grid ad on white background. Top row divided 50/50: Left: [BRAND] UI screenshot or logo, clean. Right: [COMPETITOR CATEGORY like \"Other Tools\"] with a generic cluttered UI or logo. Below: three horizontal rows spanning full width, divided 50/50 by a thin black vertical line. Each row compares one attribute. Row 1: \"[YOUR ADVANTAGE like Ships in minutes.]\" vs \"[COMPETITOR WEAKNESS like Requires days of setup.]\". Row 2: \"[YOUR ADVANTAGE like AI does the heavy lifting.]\" vs \"[COMPETITOR WEAKNESS like All manual. No automation.]\". Row 3: \"[YOUR ADVANTAGE like One flat price. Unlimited seats.]\" vs \"[COMPETITOR WEAKNESS like Per-seat pricing that adds up.]\". All text in bold black serif or heavy sans-serif, centered in each cell. No icons, no colors, no checkmarks — copy contrast does the work. Should feel like a viral X or Reddit comparison post. 1:1 aspect ratio.",
    description: "Comparison Grid / Table",
    needs: ["BRAND", "COMPETITOR_CATEGORY", "YOUR_ADVANTAGE", "COMPETITOR_WEAKNESS"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots for UI colors ONLY. Do NOT use ad layouts. This must look like a real person's Instagram Story. Create: a casual iPhone photo of [PERSON DESCRIPTION like a young woman's hands with minimal jewelry] using [DEVICE like a MacBook] with the [BRAND] interface open on screen. Natural overhead daylight, warm, iPhone 15 quality. Scattered across the frame: 5 text bubbles using Instagram Story's built-in highlighted text tool, varied highlight colors. Bubble 1: \"[TOPIC + EMOJI like AI tools 🤖]\" large and bold. Bubble 2: \"[EDUCATIONAL HOOK — a surprising stat or insight about the category]\". Bubble 3: \"[WHY THIS PRODUCT — the specific feature that makes it different, excited informal tone]\". Bubble 4: \"[PERSONAL RESULT — early experience update, first-person, with emoji]\". Bubble 5: \"[BRAND ENDORSEMENT — one short line of approval]\". Should feel casual and hand-placed, not designed. 9:16 aspect ratio.",
    description: "UGC Story Callout / Text Bubble Explainer",
    needs: ["PERSON_DESCRIPTION", "DEVICE", "BRAND", "TOPIC_EMOJI", "EDUCATIONAL_HOOK_A_SURPRISING_STAT_OR_INSIGHT_ABOUT_THE_CATEGORY", "WHY_THIS_PRODUCT_THE_SPECIFIC_FEATURE_THAT_MAKES_IT_DIFFERENT_EXCITED_INFORMAL_TONE", "PERSONAL_RESULT_EARLY_EXPERIENCE_UPDATE_FIRST_PERSON_WITH_EMOJI", "BRAND_ENDORSEMENT_ONE_SHORT_LINE_OF_APPROVAL"],
    default_aspect_ratio: "9:16",
  },
  {
    prompt:
      "Use the attached brand screenshots for tone only. Create: a static ad designed to look like a real online tech news article screenshot. Top 25%: white background with a realistic major tech publication masthead in large bold black serif [PUBLICATION STYLE like \"TechCrunch\" / \"The Verge\" / \"Fast Company\"]. Below: thin gray horizontal rule. Small gray text \"Latest\" left-aligned. Then: bold black serif headline spanning full width: \"[HEADLINE like 'The $[PRICE]/mo tool with [NUMBER] five-star reviews that teams are calling the most useful AI of [YEAR]']\". Bottom 60%: two side-by-side casual workspace or screen photos — one showing the product in context, one showing a team member or happy user, both looking candid and UGC-style. No brand logo. No CTA. Should look like an article screenshot someone would share to their story. 4:5 aspect ratio.",
    description: "Faux Press / News Article Screenshot",
    needs: ["PUBLICATION_STYLE", "HEADLINE", "PRICE", "NUMBER", "YEAR"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact UI design and brand colors precisely. Create: a static ad disguised as an iPhone or browser screenshot. Top: realistic iOS or browser status bar with [TIME like 10:45], battery, signal icons. Below: [BRAND] app or web interface navigation bar with logo and menu items. Below nav: the [BRAND] [KEY FEATURE SCREEN like AI generation panel / analytics summary / content calendar] with live data. Overlaid or adjacent to specific interface elements: [3 CALLOUT ROWS] each with a [BRAND COLOR] filled circle checkmark + [EMOJI] + bold black text using value-format: \"[BENEFIT 1 like AI output in under 30 seconds]\" / \"[BENEFIT 2 like Full brand voice trained in 2 minutes]\" / \"[BENEFIT 3 like One-click export to any format]\". Device or screen edge slightly visible to reinforce the screenshot framing. Clean white surrounding. 1:1 aspect ratio.",
    description: "Faux Mobile App / Dashboard Screenshot",
    needs: ["TIME", "BRAND", "KEY_FEATURE_SCREEN", "3_CALLOUT_ROWS", "BRAND_COLOR", "EMOJI", "BENEFIT_1", "BENEFIT_2", "BENEFIT_3"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact UI design and brand colors precisely. Create: a product showcase ad on a [BACKGROUND COLOR like deep navy / soft gray-blue] background. Top: large bold [TEXT COLOR like white or brand color] uppercase sans-serif headline: \"[SUPERLATIVE CLAIM like THE SMARTEST MARKETING PLATFORM ALIVE]\". Below headline: white rounded-rectangle CTA button with [BRAND COLOR] uppercase text \"[CTA like START FREE — NO CARD NEEDED]\". Center: a [BRAND] main dashboard in a realistic browser frame, angled slightly, hero-lit with soft ambient light. Surrounding the frame: [FLOATING ELEMENTS like small UI cards, notification badges, mini stat chips, integration logos] arranged in a radial pattern creating energy and showing ecosystem breadth. Bottom: a white stat bar spanning the width with three metrics: \"[STAT 1 like 50,000+ TEAMS]\" | \"[STAT 2 like 4.9★ RATING]\" | \"[STAT 3 like 10× OUTPUT]\" in bold [BRAND COLOR]. 1:1 aspect ratio.",
    description: "Hero Dashboard Showcase + Stat Bar",
    needs: ["BACKGROUND_COLOR", "TEXT_COLOR", "SUPERLATIVE_CLAIM", "BRAND_COLOR", "CTA", "BRAND", "FLOATING_ELEMENTS", "STAT_1", "STAT_2", "STAT_3"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots for product UI ONLY. This should look like a real person's photo. Create: a lifestyle photo set in [SETTING like a bright modern office or home workspace]. In the background: a small tabletop whiteboard propped on a desk. On the whiteboard: two simple hand-drawn black marker sections — left labeled \"[BEFORE LABEL like Without [BRAND]:]\" showing [BEFORE STATE like a tangled flow diagram with crossed-out steps and question marks], an arrow pointing right to a section labeled \"[AFTER LABEL like With [BRAND]!]\" showing [AFTER STATE like a clean simple 3-step flow with a smiley face]. Below the drawings: handwritten text \"[HANDWRITTEN CTA like If you're still doing this manually, you need this!]\". In the foreground: [PERSON'S HAND] holding a phone or laptop showing the [BRAND] interface. Product screen clearly visible. Shot on iPhone, natural window lighting. 4:5 aspect ratio.",
    description: "Whiteboard Workflow Before / After",
    needs: ["SETTING", "BEFORE_LABEL", "BEFORE_STATE", "AFTER_LABEL", "AFTER_STATE", "HANDWRITTEN_CTA", "PERSON_S_HAND", "BRAND"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a promotional variant on a [BACKGROUND like dark charcoal / deep navy] background. Top 12%: white or light banner with massive bold [DARK COLOR] uppercase headline: \"[PROVOCATIVE 2-3 WORD STATEMENT like TEAM MULTIPLIER.]\" with a period. Upper-left: a [BRIGHT ACCENT COLOR like neon green] comic-style starburst rotated slightly: \"GET [DISCOUNT like 40%] OFF YOUR FIRST [PERIOD like 3 MONTHS]\" in bold black text. Center: a device mockup (MacBook or iPad) showing the [BRAND] dashboard, [PERSON'S HAND] on the keyboard, slightly dramatic moody lighting. Below: three evenly spaced icon-and-text columns on a dark semi-transparent strip: [ICON 1 + LABEL like (lightning bolt) INSTANT AI] | [ICON 2 + LABEL like (team icon) BUILT FOR TEAMS] | [ICON 3 + LABEL like (chart icon) PROVEN ROI]. Very bottom: full-width [BRIGHT ACCENT COLOR] banner: \"[PROMO like LIMITED TIME — LAUNCH OFFER]\" in bold [DARK] text. 1:1 aspect ratio.",
    description: "Hero Statement + Offer Burst (Promo Variant)",
    needs: ["BACKGROUND", "DARK_COLOR", "PROVOCATIVE_2_3_WORD_STATEMENT", "BRIGHT_ACCENT_COLOR", "DISCOUNT", "PERIOD", "BRAND", "PERSON_S_HAND", "ICON_1_LABEL", "ICON_2_LABEL", "ICON_3_LABEL", "PROMO", "DARK"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Create: a vertical split social proof ad. Left 55%: a casual UGC-style photo of [PERSON like a focused professional in a modern café or home office] working on a laptop with the [BRAND] interface open — natural light, warm and inviting, iPhone-quality candid feel. Person looks genuinely engaged, not posed. Right 45%: solid [PRIMARY BRAND COLOR like deep indigo] background. Top-right: small sparkle/star accents in [ACCENT COLOR like gold]. Floating center-right: a device mockup (phone) showing the [BRAND] key screen, studio-lit on the colored background. Below device: a white rounded-rectangle review card with five filled [ACCENT COLOR] stars, italic text: \"[SHORT REVIEW QUOTE like 'I cut my Monday prep from 4 hours to 20 minutes']\" in [BRAND COLOR]. Bottom center: [BRAND LOGO] in white with small sparkle accents. 4:5 aspect ratio.",
    description: "UGC Lifestyle + Review Card (Split)",
    needs: ["PERSON", "BRAND", "PRIMARY_BRAND_COLOR", "ACCENT_COLOR", "SHORT_REVIEW_QUOTE", "BRAND_COLOR", "BRAND_LOGO"],
    default_aspect_ratio: "4:5",
  },
  {
    prompt:
      "Use the attached brand screenshots for visual tone ONLY. Do NOT include any product, logo, or branding. Create: a scroll-stopping curiosity ad. Top 35%: clean white background with large bold black sans-serif text (heavy weight, tight leading): \"[HOOK HEADLINE like Most marketing teams don't realize THIS is why they're burning 20+ hours a week but did you know...]\". The last words are followed by \"...more\" in lighter gray, mimicking a truncated Instagram or Facebook caption. Bottom 65%: a close-up, slightly uncomfortable photo of [PROBLEM VISUAL like a cluttered multi-tab browser screen / a stack of scattered sticky notes / a frustrated person staring at a monitor — no product visible]. Photo feels real and editorial. Slightly shallow depth of field. No text on the photo. No product. No logo. No CTA. The entire purpose is to provoke curiosity. 1:1 aspect ratio.",
    description: "Curiosity Gap + Scroll-Stopper Hook",
    needs: ["HOOK_HEADLINE", "PROBLEM_VISUAL"],
    default_aspect_ratio: "1:1",
  },
  {
    prompt:
      "Use the attached brand screenshots as reference. Match the exact [UI DESCRIPTION — key screen, brand colors, logo placement] precisely. Create: a lifestyle photo set in [REAL-LIFE SETTING like a warm home office desktop / a marble desk surface / a minimal coworking table] with [LIGHTING DESCRIPTION like soft natural daylight from a nearby window / warm diffused afternoon light] and a naturally blurred background showing [BACKGROUND DETAILS like a bookshelf / plant / coffee mug]. Frame is very slightly off-center — device not perfectly centered, feels found rather than composed. Slight natural sensor grain consistent with a phone camera in indoor daylight. Subtle natural vignette at frame corners. Center of frame: a [DEVICE like open MacBook / iPad propped at an angle] showing the [BRAND] [KEY FEATURE SCREEN], sitting on [SURFACE like light wood desk / marble counter], slightly angled toward the viewer. Stuck onto the screen edge or device lid: a [POST-IT COLOR like yellow] square post-it note, slightly crooked. Realistic paper texture with a horizontal crease as if folded once. Subtle curl at bottom-right. Held at the top by a small piece of clear tape, slightly wrinkled. Handwritten in thick black marker, imperfect lowercase: \"[LINE 1 — lowercase short setup or hook]\" / \"[LINE 2 — continuation or turn]\" / \"[LINE 3 — punchline, result, or kicker]\" / \"[LINE 4 — optional emoji beat]\". Bottom center outside the photo: small plain lowercase caption text: \"[brand url] — [3-5 word casual caption]\". No logo overlay. Brand identity carried by the visible UI. No border. [MOOD — 3 adjectives]. 4:5 aspect ratio.",
    description: "Native / Sticky Note Style (Screen Hero)",
    needs: ["UI_DESCRIPTION_KEY_SCREEN_BRAND_COLORS_LOGO_PLACEMENT", "REAL_LIFE_SETTING", "LIGHTING_DESCRIPTION", "BACKGROUND_DETAILS", "DEVICE", "BRAND", "KEY_FEATURE_SCREEN", "SURFACE", "POST_IT_COLOR", "LINE_1_LOWERCASE_SHORT_SETUP_OR_HOOK", "LINE_2_CONTINUATION_OR_TURN", "LINE_3_PUNCHLINE_RESULT_OR_KICKER", "LINE_4_OPTIONAL_EMOJI_BEAT", "BRAND_URL", "3_5_WORD_CASUAL_CAPTION", "MOOD_3_ADJECTIVES"],
    default_aspect_ratio: "4:5",
  },
];
