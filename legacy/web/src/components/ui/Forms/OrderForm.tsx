"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, type OrderFormData } from "@/lib/validations";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { Button } from "../Buttons/Button";

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void | Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<OrderFormData>;
}

export function OrderForm({ onSubmit, isLoading = false, defaultValues }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: defaultValues || {
      phone: "+7",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Имя"
          placeholder="Введите имя"
          {...register("firstName")}
          error={errors.firstName?.message}
        />

        <FormInput
          label="Фамилия"
          placeholder="Введите фамилию"
          {...register("lastName")}
          error={errors.lastName?.message}
        />
      </div>

      <FormInput
        label="Телефон"
        placeholder="+7"
        defaultValue="+7"
        {...register("phone")}
        error={errors.phone?.message}
      />

      <FormInput
        label="Email (необязательно)"
        type="email"
        placeholder="example@mail.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Адрес доставки</h3>
        
        <FormInput
          label="Город"
          placeholder="Введите город"
          {...register("city")}
          error={errors.city?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Улица"
            placeholder="Введите улицу"
            {...register("street")}
            error={errors.street?.message}
          />

          <FormInput
            label="Дом"
            placeholder="Введите номер дома"
            {...register("building")}
            error={errors.building?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Корпус (необязательно)"
            placeholder="Корпус"
            {...register("house")}
            error={errors.house?.message}
          />

          <FormInput
            label="Квартира (необязательно)"
            placeholder="Квартира"
            {...register("apartment")}
            error={errors.apartment?.message}
          />
        </div>
      </div>

      <FormTextarea
        label="Комментарий к заказу (необязательно)"
        placeholder="Дополнительная информация к заказу"
        rows={4}
        className="px-2"
        {...register("comment")}
        error={errors.comment?.message}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? "Оформление заказа..." : "ОФОРМИТЬ ЗАКАЗ"}
      </Button>

      <p className="text-xs text-gray-smoky text-center">
        Нажимая на кнопку вы соглашаетесь на обработку ваших персональных данных
      </p>
    </form>
  );
}

