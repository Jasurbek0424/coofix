"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { PasswordInput } from "./PasswordInput";
import { Button } from "../Buttons/Button";

import GoogleG from "@/assets/google.png";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  onGoogleLogin?: (idToken: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, onGoogleLogin, isLoading = false }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleClick = async () => {
    if (!onGoogleLogin) {
      console.error('onGoogleLogin is not provided');
      return;
    }

    try {
      setIsGoogleLoading(true);
      const { signInWithGoogle } = await import('@/lib/googleAuth');
      const idToken = await signInWithGoogle();
      await onGoogleLogin(idToken);
    } catch (error) {
      console.error('Google login error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при входе через Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label="Электронная почта"
        type="email"
        placeholder="example@mail.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <PasswordInput
        label="Пароль"
        placeholder="Введите пароль"
        {...register("password")}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        variant="dark"
        fullWidth
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? "Вход..." : "ВОЙТИ"}
      </Button>

      {/* Google Login Button */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-coal" />
          <span className="text-sm text-gray-smoky">или</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-coal" />
        </div>
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isGoogleLoading || isLoading || !onGoogleLogin}
          className="w-full flex items-center justify-center rounded gap-3 px-4 py-3 bg-statDark dark:text-white hover:bg-orange cursor-pointer border border-coal disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Image
              src={GoogleG}
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          <span className="text-sm font-medium text-foreground">
            {isGoogleLoading ? "Вход..." : "Войти через Google"}
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку, вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
