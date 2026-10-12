"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Buttons/Button";
import { AiFillSetting } from "react-icons/ai";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl text-center">
        <div className="mb-10 flex flex-col items-center">
          <h1 className="flex items-center justify-center font-bold text-gray-dark text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4">
            <span>4</span>
            <AiFillSetting className="text-orange rotate-45 text-5xl sm:text-6xl md:text-7xl lg:text-8xl" />
            <span>4</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-dark mb-4">
            Страница не найдена
          </h2>
          <p className="text-base sm:text-lg text-gray-smoky mb-8 max-w-lg">
            Извините, запрашиваемая страница не существует или была перемещена.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => router.push("/")}
            fullWidth
          >
            На главную
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            fullWidth
          >
            Назад
          </Button>
        </div>

        <div className="mt-10 pt-6 border-t border-gray">
          <p className="text-xs sm:text-sm text-gray-smoky">
            Если вы считаете, что это ошибка, пожалуйста,{" "}
            <a
              href="/contacts"
              className="text-orange hover:underline"
            >
              свяжитесь с нами
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

