"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { registrationSchema, type RegistrationFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { PasswordInput } from "./PasswordInput";
import { Button } from "../Buttons/Button";
import { useState } from "react";
import GoogleLogo from "@/assets/google.png";

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void | Promise<void>;
  onGoogleLogin?: (idToken: string) => void | Promise<void>;
  isLoading?: boolean;
  onEmailCheck?: (email: string) => Promise<boolean>;
}

export function RegistrationForm({
  onSubmit,
  onGoogleLogin,
  isLoading = false,
  onEmailCheck,
}: RegistrationFormProps) {
  const [emailError, setEmailError] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const email = watch("email");

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
      console.error('Google registration error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при регистрации через Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email validation with server check
  const validateEmail = async (emailValue: string) => {
    if (onEmailCheck && emailValue) {
      try {
        const exists = await onEmailCheck(emailValue);
        if (exists) {
          setEmailError("Пользователь с таким email уже существует");
          return false;
        }
        setEmailError("");
        return true;
      } catch (error) {
        console.error("Email check error:", error);
        return true;
      }
    }
    return true;
  };

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const emailValid = await validateEmail(data.email);
        if (emailValid) {
          await onSubmit(data);
        }
      })}
      className="space-y-6"
    >
      <FormInput
        label="Фамилия"
        placeholder="Введите фамилию"
        {...register("lastName")}
        error={errors.lastName?.message}
      />

      <FormInput
        label="Имя"
        placeholder="Введите имя"
        {...register("firstName")}
        error={errors.firstName?.message}
      />

      <FormInput
        label="Телефон"
        placeholder="+7(XXX)XXXXXXX"
        defaultValue="+7"
        {...register("phone")}
        error={errors.phone?.message}
      />

      <FormInput
        label="Электронная почта"
        type="email"
        placeholder="example@mail.com"
        {...register("email", {
          onBlur: () => email && validateEmail(email),
        })}
        error={errors.email?.message || emailError}
      />

      <PasswordInput
        label="Новый пароль"
        placeholder="Введите пароль"
        {...register("password")}
        error={errors.password?.message}
        helperText="Пароль не менее 6 символов, содержит заглавные буквы (A-Z)"
      />

      <PasswordInput
        label="Подтвердите новый пароль"
        placeholder="Подтвердите пароль"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? "Регистрация..." : "РЕГИСТРАЦИЯ"}
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
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-statDark dark:text-white hover:bg-orange cursor-pointer border border-coal rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Image
              src={GoogleLogo}
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          <span className="text-sm font-medium text-foreground">
            {isGoogleLoading ? "Регистрация..." : "Зарегистрироваться через Google"}
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
