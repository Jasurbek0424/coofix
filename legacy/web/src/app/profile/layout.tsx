"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useUser } from "@/store/useUser";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, token, isLoading, fetchProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Reload qilinganda token bor bo'lsa, profile'ni fetch qilish
    if (!isLoading && token && !isAuthenticated) {
      // Token bor lekin isAuthenticated false bo'lsa, profile fetch qilish
      fetchProfile();
    }
  }, [token, isAuthenticated, isLoading, fetchProfile]);

  useEffect(() => {
    // Agar token bo'lmasa va loading tugaganda, login'ga yo'naltirish
    if (!isLoading && !token && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, token, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Личный кабинет" },
          ]}
        />
        <h1 className="text-3xl font-bold text-foreground mb-6">Личный кабинет</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <ProfileSidebar />
          <div className="flex-1 bg-white dark:bg-coal rounded-lg p-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

