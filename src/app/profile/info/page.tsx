"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/store/useUser";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { Loader } from "@/components/shared/Loader";

export default function PersonalInfoPage() {
  const { isAuthenticated, isLoading, fetchProfile, user } = useUser();
  const router = useRouter();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Faqat bir marta yuklash va agar user ma'lumotlari bo'sh bo'lsa
    if (isAuthenticated && !hasLoadedRef.current && !user) {
      hasLoadedRef.current = true;
      fetchProfile();
    }
  }, [isAuthenticated, isLoading, router, fetchProfile, user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PersonalInfoForm />
      <div className="border-t border-gray pt-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
