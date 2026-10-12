"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ApiImage } from "@/lib/api/types";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";

const OPTIMIZABLE = /^https:\/\/(www\.)?coofix\.store\/media\//;

interface Props {
  image: ApiImage | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Show the "photo coming soon" caption in the placeholder. */
  caption?: boolean;
  fit?: "contain" | "cover";
}

/** Product photo with a branded placeholder for missing/broken images. */
export function ProductImage({ image, alt, className, sizes = "(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw", priority, caption, fit = "contain" }: Props) {
  const [failed, setFailed] = useState(false);
  const src = image?.url;
  const ok = src && !failed && /^(https?:\/\/|\/)/.test(src);

  return (
    <div className={cn("relative overflow-hidden", ok ? "bg-[#f3f5f7]" : "bg-surface-2", className)}>
      {ok ? (
        <Image
          src={src}
          alt={image?.alt || alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!OPTIMIZABLE.test(src) && !src.startsWith("/")}
          onError={() => setFailed(true)}
          className={cn(fit === "contain" ? "object-contain p-[6%] mix-blend-multiply" : "object-cover")}
        />
      ) : (
        <Placeholder caption={caption} />
      )}
    </div>
  );
}

function Placeholder({ caption }: { caption?: boolean }) {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,var(--surface)_0%,var(--surface-2)_72%)] text-line-strong">
      <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 w-[44%] max-w-40 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <polygon points="98,50 74,91.6 26,91.6 2,50 26,8.4 74,8.4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
      </svg>
      <Icon name="drill" className="absolute left-1/2 top-1/2 w-[18%] max-w-14 h-auto -translate-x-1/2 -translate-y-1/2 text-muted/60" />
      {caption && <span className="absolute inset-x-0 bottom-[12%] text-center text-xs font-medium text-muted">{t("product.noImage")}</span>}
    </div>
  );
}
