"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { PasswordInput } from "./PasswordInput";
import { Button } from "../Buttons/Button";
import { useState } from "react";

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void | Promise<void>;
  isLoading?: boolean;
  onEmailCheck?: (email: string) => Promise<boolean>;
}

export function RegistrationForm({
  onSubmit,
  isLoading = false,
  onEmailCheck,
}: RegistrationFormProps) {
  const [emailError, setEmailError] = useState<string>("");

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

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
