// src/app/about/page.tsx
"use client";

import About from "@/components/layout/About";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      <div className="flex-1">
      <About />
      </div>
      <div className="mt-auto">
      <Footer />
      </div>
    </div>
  );
}