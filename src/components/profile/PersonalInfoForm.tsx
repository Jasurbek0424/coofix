"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/Forms/FormInput";
import { Button } from "@/components/ui/Buttons/Button";
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/validations";
import { updateProfile } from "@/api/auth";
import { useUser } from "@/store/useUser";
import { useState, useEffect } from "react";
// Toast functionality will be handled via state

export function PersonalInfoForm() {
  const { user, fetchProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      // Backend'dan name kelayotgan bo'lsa, uni firstName ga map qilamiz
      reset({
        lastName: user.lastName || "",
        firstName: user.firstName || user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        city: user.city || "",
        street: user.street || "",
        building: user.building || "",
        house: user.house || "",
        apartment: user.apartment || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      await updateProfile(data);
      await fetchProfile();
      setSuccessMessage("Данные успешно сохранены");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setErrorMessage(error?.response?.data?.message || "Ошибка при сохранении данных");
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
        <h2 className="text-xl font-semibold text-foreground mb-4">Личные данные</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
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
              placeholder="+375 495 323-15-15"
              {...register("phone")}
              error={errors.phone?.message}
            />
            <FormInput
              label="Электронная почта"
              type="email"
              placeholder="cmirnoval@gmail.com"
              {...register("email")}
              error={errors.email?.message}
            />
            {/* Button below email field in left column */}
            <Button
              type="submit"
              variant="gray"
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? "Сохранение..." : "СОХРАНИТЬ ИЗМЕНЕНИЯ"}
            </Button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <FormInput
              label="Город"
              placeholder="Введите город"
              {...register("city")}
              error={errors.city?.message}
            />
            <FormInput
              label="Улица"
              placeholder="1-й пр-т Победителей"
              {...register("street")}
              error={errors.street?.message}
            />
            <FormInput
              label="Корпус"
              placeholder="2"
              {...register("building")}
              error={errors.building?.message}
            />
            <FormInput
              label="Дом"
              placeholder="16"
              {...register("house")}
              error={errors.house?.message}
            />
            <FormInput
              label="Квартира"
              placeholder="301"
              {...register("apartment")}
              error={errors.apartment?.message}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

