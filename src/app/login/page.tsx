"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/ui/Forms";
import { useUser } from "@/store/useUser";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader } from "@/components/shared/Loader";
import type { LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const { login: loginUser, loginWithGoogle: loginUserWithGoogle, isLoading, error, clearError, isAuthenticated, _hasHydrated } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Hydration tugaguncha yoki localStorage'dan token'ni tekshirish
  useEffect(() => {
    // localStorage'dan to'g'ridan-to'g'ri tekshirish (hydration'dan oldin ham ishlaydi)
    if (typeof window !== "undefined") {
      const userStorage = localStorage.getItem("user-storage");
      if (userStorage) {
        try {
          const parsed = JSON.parse(userStorage);
          const token = parsed?.state?.token;
          if (token) {
            // Token bor bo'lsa, darhol redirect qilish
            router.replace("/profile/orders");
            return;
          }
        } catch (error) {
          console.error("Failed to parse user storage:", error);
        }
      }
    }

    // Hydration tugagandan keyin isAuthenticated'ni tekshirish
    if (_hasHydrated && isAuthenticated) {
      router.replace("/profile/orders");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      clearError(); // Store'dagi eski xatolarni tozalash
      await loginUser(data.email, data.password);
      router.push("/profile/orders");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Login error:", err);
      // Backend'dan kelgan xatolarni ko'rsatish yoki default message
      const errorMessage = err?.response?.data?.message || err?.message;
      // "Invalid password" yoki boshqa inglizcha xatolarni rus tiliga o'girish
      if (errorMessage?.toLowerCase().includes("invalid password") || 
          errorMessage?.toLowerCase().includes("password")) {
        setLoginError("Ошибка при входе. Проверьте email и пароль.");
      } else if (errorMessage) {
        setLoginError(errorMessage);
      } else {
        setLoginError("Ошибка при входе. Проверьте email и пароль.");
      }
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setIsGoogleLoading(true);
      setLoginError(null);
      clearError();
      await loginUserWithGoogle(idToken);
      router.push("/profile/orders");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Google login error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Ошибка при входе через Google";
      setLoginError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
            Вход
          </h1>
          
          {loginError && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {loginError}
            </div>
          )}

          <LoginForm 
            onSubmit={handleLogin} 
            onGoogleLogin={handleGoogleLogin}
            isLoading={isLoading || isGoogleLoading} 
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-smoky">
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="text-orange hover:text-orange/80 font-medium transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
