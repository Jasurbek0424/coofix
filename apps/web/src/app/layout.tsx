import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { api } from "@/lib/api/server";
import { SITE_URL } from "@/lib/site";
import { organizationLd } from "@/lib/seo";
import { t } from "@/i18n";
import { AppProviders } from "@/components/providers/AppProviders";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Theme } from "@/components/layout/ThemeToggle";

const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], variable: "--font-unbounded", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: t("meta.defaultTitle"), template: t("meta.titleTemplate") },
  description: t("meta.defaultDescription"),
  applicationName: t("meta.siteName"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: t("meta.siteName"),
    url: SITE_URL,
    title: t("meta.defaultTitle"),
    description: t("meta.defaultDescription"),
    images: [{ url: "/og.jpg", width: 1000, height: 1000, alt: t("meta.ogAlt") }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161a1b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const raw = jar.get("theme")?.value;
  const theme: Theme = raw === "light" || raw === "dark" ? raw : "system";
  const categories = await api.soft(api.categories(), []);

  return (
    <html lang="ru" data-theme={theme === "system" ? undefined : theme} className={`${onest.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only z-[100] rounded-lg bg-brand px-4 py-2 font-semibold text-on-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          {t("common.skipToContent")}
        </a>
        <AppProviders>
          <TopBar theme={theme} />
          <Header categories={categories} />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer categories={categories} />
          <MobileTabBar />
        </AppProviders>
        <JsonLd data={organizationLd()} />
      </body>
    </html>
  );
}
