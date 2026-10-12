"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { smsVerificationSchema, type SMSVerificationFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { Button } from "../Buttons/Button";
import { useState, useEffect } from "react";

interface SMSVerificationFormProps {
  onSubmit: (data: SMSVerificationFormData) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
  isLoading?: boolean;
  countdown?: number; // seconds
}

export function SMSVerificationForm({
  onSubmit,
  onResend,
  isLoading = false,
  countdown = 60,
}: SMSVerificationFormProps) {
  const [timer, setTimer] = useState(countdown);
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SMSVerificationFormData>({
    resolver: zodResolver(smsVerificationSchema),
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (canResend && onResend) {
      await onResend();
      setTimer(countdown);
      setCanResend(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-sm text-foreground mb-2">4 цифры</p>
        <FormInput
          type="text"
          placeholder="0000"
          maxLength={4}
          className="text-center text-2xl tracking-widest"
          {...register("code")}
          error={errors.code?.message}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? "Проверка..." : "ПОДТВЕРДИТЬ"}
      </Button>

      {onResend && (
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-orange hover:text-orange/80 transition-colors"
            >
              Отправить код ещё раз
            </button>
          ) : (
            <p className="text-sm text-smoky">
              Отправить код ещё раз можно через {formatTime(timer)}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
