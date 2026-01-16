"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../Buttons/Button";
import { FormInput, FormTextarea } from "@/components/ui/Forms";

const wholesaleSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email адрес"),
  comment: z.string().optional(),
  file: z.any().optional(),
});

export type WholesaleFormData = z.infer<typeof wholesaleSchema>;

interface WholesaleFormProps {
  onSubmit?: () => void;
}

export function WholesaleForm({ onSubmit }: WholesaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WholesaleFormData>({
    resolver: zodResolver(wholesaleSchema),
  });

  const onFormSubmit = async (data: WholesaleFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      if (data.comment) {
        formData.append("comment", data.comment);
      }
      if (data.file && data.file.length > 0) {
        formData.append("file", data.file[0]);
      }

      const response = await fetch("/api/wholesale", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        reset();
        setSelectedFile(null);
        onSubmit?.();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(result.message || "Ошибка при отправке заявки");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Произошла ошибка при отправке заявки"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
      {/* Top row: Телефон, Почта, Имя */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormInput
          label="Телефон:"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <FormInput
          label="Почта:"
          type="email"
          placeholder="example@mail.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <FormInput
          label="Имя:"
          placeholder="Введите ваше имя"
          {...register("firstName")}
          error={errors.firstName?.message}
        />
      </div>

      {/* Фамилия */}
      <FormInput
        label="Фамилия:"
        placeholder="Введите вашу фамилию"
        {...register("lastName")}
        error={errors.lastName?.message}
      />

      {/* Комментарий */}
      <FormTextarea
        label="Комментарий:"
        placeholder="Введите комментарий (необязательно)"
        rows={4}
        {...register("comment")}
        error={errors.comment?.message}
      />

      {/* File attachment */}
      <div>
        <label className="flex items-center gap-2 text-orange hover:text-orange/80 cursor-pointer underline decoration-dotted text-sm">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
          <span>Прикрепить файл к сообщению</span>
          <input
            type="file"
            {...register("file")}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              } else {
                setSelectedFile(null);
              }
            }}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </label>
        {selectedFile && (
          <p className="text-xs text-gray-smoky mt-1">
            Выбран файл: {selectedFile.name}
          </p>
        )}
      </div>

      {submitError && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-3 py-2 rounded text-sm">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-500/10 border border-green-500 text-green-600 dark:text-green-400 px-3 py-2 rounded text-sm">
          Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full sm:w-auto text-sm px-6 py-2"
      >
        {isSubmitting ? "Отправка..." : "Отправить заявку"}
      </Button>
    </form>
  );
}
