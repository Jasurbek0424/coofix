"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegistrationForm } from "@/components/ui/Forms";
import { register as registerAPI } from "@/api/auth";
import { useUser } from "@/store/useUser";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { RegistrationFormData } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (data: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Register API call
      const response = await registerAPI({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      if (response.success && response.user && response.token) {
        // Store user data and token
        setUser(response.user);
        setToken(response.token);

        setSuccessMessage("Регистрация успешна! Перенаправление...");
        
        // Redirect to profile after 1 second
        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      } else {
        setError(response.message || "Ошибка при регистрации");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при регистрации. Попробуйте еще раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Email check function (optional - if backend supports it)
  const checkEmailExists = async (email: string): Promise<boolean> => {
    // This can be implemented if backend has an endpoint to check email
    // For now, return false (email doesn't exist)
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
            Регистрация
          </h1>

          {successMessage && (
            <div className="mb-6 bg-green-500/10 border border-green-500 text-green-600 dark:text-green-400 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <RegistrationForm
            onSubmit={handleRegister}
            isLoading={isLoading}
            onEmailCheck={checkEmailExists}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-smoky">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="text-orange hover:text-orange/80 font-medium transition-colors"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

