import Image from "next/image";
import Link from "next/link";
import type { CategoryNode } from "@/lib/api/types";
import { Icon } from "@/components/ui/Icon";

const REMOTE_OK = /^https:\/\/(www\.)?coofix\.store\/media\//;

export function CategoryTiles({ categories }: { categories: CategoryNode[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4" role="list">
      {categories.map((c, i) => (
        <li key={c.id}>
          <Link
            href={`/catalog/${c.slug}`}
            className="group relative flex h-full min-h-36 flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-md sm:min-h-44 sm:p-5"
          >
            {c.image_url && /^https?:\/\//.test(c.image_url) ? (
              <Image
                src={c.image_url}
                alt=""
                width={160}
                height={160}
                unoptimized={!REMOTE_OK.test(c.image_url)}
                className="absolute -bottom-2 -right-2 size-24 object-contain transition-transform duration-500 group-hover:scale-105 sm:size-32"
              />
            ) : (
              <svg viewBox="0 0 100 100" className="absolute -bottom-6 -right-6 size-28 text-brand-soft transition-transform duration-500 group-hover:rotate-[30deg] sm:size-36" aria-hidden="true">
                <polygon points="98,50 74,91.6 26,91.6 2,50 26,8.4 74,8.4" fill="currentColor" />
              </svg>
            )}
            <span className="relative font-display text-[11px] font-bold text-muted tabular">{String(i + 1).padStart(2, "0")}</span>
            <span className="relative">
              <span className="block text-[15px] font-semibold leading-snug sm:text-base">{c.name}</span>
              {c.children.length > 0 && <span className="mt-1 block text-xs text-muted">{c.children.slice(0, 3).map((x) => x.name).join(" · ")}</span>}
              <Icon name="arrowRight" className="mt-3 size-5 text-brand-text transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
