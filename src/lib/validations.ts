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

// Profile update validation
export const profileUpdateSchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  phone: z.string().regex(/^\+?\d{10,15}$/, "Неверный формат телефона").optional().or(z.literal("")),
  email: z.string().email("Неверный формат email").optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  house: z.string().optional(),
  apartment: z.string().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Password change validation
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Старый пароль обязателен"),
  newPassword: z
    .string()
    .min(6, "Пароль не менее 6 символов")
    .regex(/[A-Z]/, "Пароль должен содержать заглавные буквы (A-Z)"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Order form validation
export const orderSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  phone: z.string().regex(/^\+7\s?\d{3}\s?\d{3}\d{2}\d{2}$/, "Неверный формат телефона"),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  city: z.string().min(2, "Город обязателен"),
  street: z.string().min(2, "Улица обязательна"),
  building: z.string().min(1, "Дом обязателен"),
  house: z.string().optional(),
  apartment: z.string().optional(),
  comment: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
