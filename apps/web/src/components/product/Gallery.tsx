"use client";

import { useState } from "react";
import type { ApiImage } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { ProductImage } from "./ProductImage";

export function Gallery({ images, name }: { images: ApiImage[]; name: string }) {
  const [i, setI] = useState(0);
  const list = images.length ? images : [null];
  const current = list[Math.min(i, list.length - 1)] ?? null;
  return (
    <div aria-label={t("product.gallery")} role="region" className="flex flex-col gap-3 lg:flex-row-reverse">
      <div
        className="relative flex-1 overflow-hidden rounded-2xl border border-line"
        tabIndex={list.length > 1 ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setI((x) => (x + 1) % list.length);
          if (e.key === "ArrowLeft") setI((x) => (x - 1 + list.length) % list.length);
        }}
      >
        <ProductImage image={current} alt={name} priority caption className="aspect-square" sizes="(min-width:1024px) 50vw, 100vw" />
        {list.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-coal/80 px-2.5 py-1 text-xs font-semibold text-white tabular">
            {i + 1} / {list.length}
          </span>
        )}
      </div>
      {list.length > 1 && (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:w-20 lg:flex-col">
          {list.map((img, n) => (
            <li key={`${img?.url}-${n}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={t("product.image", { n: n + 1, total: list.length })}
                aria-current={n === i}
                className={cn("block overflow-hidden rounded-lg border-2 transition-colors", n === i ? "border-brand" : "border-line hover:border-line-strong")}
              >
                <ProductImage image={img} alt="" className="size-16 lg:size-[76px]" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
