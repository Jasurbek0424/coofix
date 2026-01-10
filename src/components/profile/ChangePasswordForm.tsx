"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/Forms/FormInput";
import { PasswordInput } from "@/components/ui/Forms/PasswordInput";
import { Button } from "@/components/ui/Buttons/Button";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validations";
import { changePassword } from "@/api/auth";
import { useState } from "react";
// Toast functionality will be handled via state
import { FiCheck } from "react-icons/fi";
import clsx from "clsx";

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  // Check if passwords match and meet requirements
  const checkPasswordMatch = () => {
    if (newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6) {
      setPasswordConfirmed(true);
    } else {
      setPasswordConfirmed(false);
    }
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccessMessage("Пароль успешно изменен");
      reset();
      setPasswordConfirmed(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to change password:", error);
      setErrorMessage(error?.response?.data?.message || "Ошибка при изменении пароля");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-600 dark:text-green-400 px-4 py-2 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Изменение пароля</h2>
        <div className="space-y-4">
          <PasswordInput
            label="Старый пароль"
            placeholder="Введите старый пароль"
            {...register("oldPassword")}
            error={errors.oldPassword?.message}
          />
          <div className="relative">
            <PasswordInput
              label="Новый пароль"
              placeholder="Введите новый пароль"
              {...register("newPassword", {
                onChange: checkPasswordMatch,
              })}
              error={errors.newPassword?.message}
            />
          </div>
          <div className="relative">
            <PasswordInput
              label="Подтвердите новый пароль"
              placeholder="Подтвердите новый пароль"
              {...register("confirmPassword", {
                onChange: checkPasswordMatch,
              })}
              error={errors.confirmPassword?.message}
            />
            {passwordConfirmed && (
              <div className="absolute right-12 top-[38px] flex items-center">
                <FiCheck className="text-green-500" size={20} />
              </div>
            )}
          </div>
          <p className="text-xs text-smoky">
            Пароль не менее 6 символов, содержит заглавные буквы (A-Z)
          </p>
          <Button
            type="submit"
            variant="gray"
            disabled={isLoading || !passwordConfirmed}
            className="mt-4"
          >
            {isLoading ? "Изменение..." : "ИЗМЕНИТЬ ПАРОЛЬ"}
          </Button>
        </div>
      </div>
    </form>
  );
}

