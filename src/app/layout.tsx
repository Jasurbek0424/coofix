import type { Metadata } from "next";
import "../styles/globals.css";
import { MarketplaceButtons } from "@/components/shared/MarketplaceButtons";
import { Noto_Sans } from "next/font/google";

import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  metadataBase: new URL("https://coofix.ru"),
  title: {
    default: "Профессиональные инструменты",
    template: "%s | COOFIX.RU",
  },
  description:
    "COOFIX.RU посвящены доступным инструментам профессионального качества. Известные бренды, такие как Bosch, Makita, Stanley, высококачественные, но слишком дорогие.",
  keywords: [
    "Силовые инструменты",
    "Садовые инструменты",
    "Аксессуары",
    "Ручные инструменты",
    "Однопопное решение",
    "Инструменты COOFIX",
    "Электроинструменты",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "COOFIX.RU — Профессиональные инструменты",
    description:
      "Качественные и доступные инструменты для профессионалов и домашних мастеров.",
    url: "https://coofix.ru",
    siteName: "COOFIX.RU",
    images: [
      {
        url: "/prew__coofix.jpg",
        width: 1200,
        height: 630,
        alt: "COOFIX.RU",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const noto = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${noto.variable} antialiased h-full flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <MarketplaceButtons />
        </ThemeProvider>
      </body>
    </html>
  );
}
