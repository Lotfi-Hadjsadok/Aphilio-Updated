import type { Metadata, Viewport } from "next";
import {
  Baloo_2,
  Cairo,
  Fuzzy_Bubbles,
  Inter,
  Geist_Mono,
} from "next/font/google";
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
    default: "Aphilio",
    template: "%s | Aphilio",
  },
  description:
    "Aphilio: DNA reads branding from any site you give it: colors, typography, logos, and voice in one flow.",
  applicationName: "Aphilio",
  icons: {
    icon: "/aphilio-logo.webp",
    apple: "/aphilio-logo.webp",
  },
  openGraph: {
    images: ["/aphilio-logo.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cairo.variable} ${baloo2.variable} ${fuzzyBubbles.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
