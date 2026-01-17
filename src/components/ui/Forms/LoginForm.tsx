"use client";

import { useEffect, useState, useRef } from "react";
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
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Auth when component mounts
    const buttonRef = googleButtonRef.current;
    
    if (onGoogleLogin && typeof window !== 'undefined') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.warn('Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local');
        return;
      }

      import('@/lib/googleAuth').then(({ loadGoogleScript }) => {
        loadGoogleScript().then(() => {
          if (window.google?.accounts?.id && buttonRef) {
            // Initialize Google Identity Services
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                if (response.credential && onGoogleLogin) {
                  setIsGoogleLoading(true);
                  try {
                    await onGoogleLogin(response.credential);
                  } catch (error) {
                    console.error('Google login error:', error);
                    alert(error instanceof Error ? error.message : 'Ошибка при входе через Google');
                  } finally {
                    setIsGoogleLoading(false);
                  }
                }
              },
            });

            // Render Google button (hidden, we'll trigger it programmatically)
            window.google.accounts.id.renderButton(buttonRef, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
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
      if (buttonRef) {
        buttonRef.innerHTML = '';
      }
    };
  }, [onGoogleLogin]);

  const handleGoogleClick = async () => {
    console.log('Google button clicked');
    
    if (!onGoogleLogin) {
      console.error('onGoogleLogin is not provided');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID is not configured');
      alert('Google Client ID не настроен');
      return;
    }

    try {
      // Load Google script if not loaded
      if (!window.google?.accounts?.id) {
        console.log('Loading Google script...');
        const { loadGoogleScript } = await import('@/lib/googleAuth');
        await loadGoogleScript();
      }

      if (!window.google?.accounts?.id) {
        console.error('Google Sign-In script failed to load');
        alert('Ошибка загрузки Google Sign-In');
        return;
      }

      // Ensure Google Auth is initialized
      if (googleButtonRef.current) {
        const googleButton = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          console.log('Clicking rendered Google button');
          googleButton.click();
          return;
        }
      }

      // Fallback: trigger One Tap prompt directly
      console.log('Triggering One Tap prompt');
      if (window.google?.accounts?.id) {
        // Ensure Google Auth is initialized before prompting
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential && onGoogleLogin) {
              setIsGoogleLoading(true);
              try {
                await onGoogleLogin(response.credential);
              } catch (error) {
                console.error('Google login error:', error);
                alert(error instanceof Error ? error.message : 'Ошибка при входе через Google');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
        });
        window.google.accounts.id.prompt();
      }
    } catch (error) {
      console.error('Error in handleGoogleClick:', error);
      alert('Ошибка при входе через Google. Попробуйте обновить страницу.');
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
        <div className="relative">
          <div ref={googleButtonRef} className="hidden" />
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
      </div>

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку, вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
