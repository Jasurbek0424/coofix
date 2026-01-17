"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { registrationSchema, type RegistrationFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { PasswordInput } from "./PasswordInput";
import { Button } from "../Buttons/Button";
import { useState, useEffect, useRef } from "react";
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
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const email = watch("email");

  useEffect(() => {
    // Initialize Google Auth when component mounts
    if (onGoogleLogin && typeof window !== 'undefined') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.warn('Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local');
        return;
      }

      import('@/lib/googleAuth').then(({ loadGoogleScript }) => {
        loadGoogleScript().then(() => {
          if (window.google?.accounts?.id && googleButtonRef.current) {
            // Initialize Google Identity Services
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                if (response.credential && onGoogleLogin) {
                  setIsGoogleLoading(true);
                  try {
                    await onGoogleLogin(response.credential);
                  } catch (error) {
                    console.error('Google registration error:', error);
                    alert(error instanceof Error ? error.message : 'Ошибка при регистрации через Google');
                  } finally {
                    setIsGoogleLoading(false);
                  }
                }
              },
            });

            // Render Google button (hidden, we'll trigger it programmatically)
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: 'outline',
              size: 'large',
              text: 'signup_with',
            });
          }
        }).catch((error) => {
          console.error('Failed to load Google Auth:', error);
        });
      }).catch((error) => {
        console.error('Failed to load Google Auth module:', error);
      });
    }

    // Cleanup
    return () => {
      const buttonRef = googleButtonRef.current;
      if (buttonRef) {
        buttonRef.innerHTML = '';
      }
    };
  }, [onGoogleLogin]);

  const handleGoogleClick = () => {
    if (googleButtonRef.current) {
      // Find and click the Google button
      const googleButton = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback: trigger One Tap prompt
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
        }
      }
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
        <div className="relative">
          <div ref={googleButtonRef} className="hidden" />
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
      </div>

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
