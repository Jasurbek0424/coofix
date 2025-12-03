"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { callbackSchema, type CallbackFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { Button } from "../Buttons/Button";

interface CallbackFormProps {
  onSubmit: (data: CallbackFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function CallbackForm({ onSubmit, isLoading = false }: CallbackFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CallbackFormData>({
    resolver: zodResolver(callbackSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label="Имя"
        placeholder="Введите ваше имя"
        {...register("name")}
        error={errors.name?.message}
      />

      <FormInput
        label="Телефон"
        placeholder="+7"
        defaultValue="+7"
        {...register("phone")}
        error={errors.phone?.message}
      />

      <FormTextarea
        label="Комментарий"
        placeholder="Введите комментарий (необязательно)"
        rows={4}
        className="px-2"
        {...register("comment")}
        error={errors.comment?.message}
      />

      <Button
        type="submit"
        variant="dark"
        fullWidth
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? "Отправка..." : "ОТПРАВИТЬ"}
      </Button>

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}
