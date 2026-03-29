import type { Metadata, Viewport } from "next";
import {
  Baloo_2,
  Cairo,
  Fuzzy_Bubbles,
  Inter,
  Geist_Mono,
} from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { isRtlLocale, type Locale } from "@/lib/i18n-locales";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const fuzzyBubbles = Fuzzy_Bubbles({
  variable: "--font-fuzzy-bubbles",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aphilio: Brand DNA Extraction & On-Brand Ad Creative Generator",
    template: "%s | Aphilio",
  },
  description:
    "Aphilio extracts your brand DNA from any URL (colors, fonts, logos, and voice), then generates on-brand ad creatives in multiple formats with AI. Free to start.",
  applicationName: "Aphilio",
  keywords: [
    "brand DNA extraction",
    "brand identity from URL",
    "AI ad creative generator",
    "on-brand ad creatives",
    "brand intelligence platform",
    "automated brand guidelines",
    "brand voice extraction",
    "marketing creative AI",
  ],
  authors: [{ name: "Aphilio" }],
  creator: "Aphilio",
  icons: {
    icon: "/aphilio-logo.webp",
    apple: "/aphilio-logo.webp",
  },
  openGraph: {
    title: "Aphilio: Turn Any URL Into On-Brand Ad Creatives",
    description:
      "Extract brand DNA from any URL (colors, fonts, logos, and voice), then generate on-brand ad images, copy, and visuals with AI.",
    type: "website",
    siteName: "Aphilio",
    locale: "en_US",
    images: [
      {
        url: "/aphilio-logo.webp",
        width: 1200,
        height: 630,
        alt: "Aphilio: Brand DNA Extraction & Ad Creative Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aphilio: Turn Any URL Into On-Brand Ad Creatives",
    description:
      "Extract brand DNA from any URL. Generate on-brand ads with AI. Free to start.",
    images: ["/aphilio-logo.webp"],
    creator: "@aphilio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale() as Locale;
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cairo.variable} ${baloo2.variable} ${fuzzyBubbles.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider>{children}</TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
