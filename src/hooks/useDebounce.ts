// hooks/useDebounce.ts

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay tugagach qiymatni yangilaydigan timer o'rnatamiz
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Agar value o'zgarsa (yoki hook qayta ishga tushsa), oldingi timeoutni bekor qilamiz
    // Bu 'cache clean' va 'eskirgan so'rovlarni bekor qilish' mantiqining bir qismi
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // value yoki delay o'zgarganda effektni qayta ishga tushiramiz

  return debouncedValue;
}