import { z } from "zod";

// Callback form validation
export const callbackSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().regex(/^\+7\s?\d{3}\s?\d{3}\d{2}\d{2}$/, "Неверный формат телефона"),
  comment: z.string().optional(),
});

export type CallbackFormData = z.infer<typeof callbackSchema>;

// Registration form validation
export const registrationSchema = z.object({
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().regex(/^\+7\s?\d{3}\s?\d{3}\d{2}\d{2}$/, "Неверный формат телефона"),
  email: z.string().email("Неверный формат email"),
  password: z
    .string()
    .min(6, "Пароль не менее 6 символов")
    .regex(/[A-Z]/, "Пароль должен содержать заглавные буквы (A-Z)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Login form validation
export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Пароль обязателен"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// SMS verification validation
export const smsVerificationSchema = z.object({
  code: z.string().length(4, "Код должен содержать 4 цифры").regex(/^\d+$/, "Код должен содержать только цифры"),
});

export type SMSVerificationFormData = z.infer<typeof smsVerificationSchema>;
