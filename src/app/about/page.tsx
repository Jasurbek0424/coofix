// src/app/about/page.tsx
"use client";

import About from "@/components/layout/About";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header />
      <About />
      <Footer />
    </>
  );
}