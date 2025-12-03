"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { Button } from "../Buttons/Button";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label="Электронная почта"
        type="email"
        placeholder="example@mail.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <FormInput
        label="Пароль"
        type="password"
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

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку, вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
