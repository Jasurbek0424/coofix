import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// Force dynamic rendering and disable static generation/caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Page-specific metadata (can override layout metadata)
export const metadata: Metadata = {
  title: "Профессиональные инструменты | COOFIX.STORE",
  description:
    "COOFIX.STORE — Профессиональные инструменты для профессионалов и домашних мастеров. Широкий ассортимент качественных инструментов по доступным ценам.",
  openGraph: {
    title: "COOFIX.STORE — Профессиональные инструменты",
    description:
      "Качественные и доступные инструменты для профессионалов и домашних мастеров.",
    url: "https://coofix.store",
    images: [
      {
        url: "/prew__coofix.jpg",
        width: 1200,
        height: 630,
        alt: "COOFIX.STORE",
      },
    ],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
