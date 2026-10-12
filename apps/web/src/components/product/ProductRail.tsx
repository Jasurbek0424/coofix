import type { ProductCard as Product } from "@/lib/api/types";
import { SectionHeading } from "@/components/ui/misc";
import { ProductCard } from "./ProductCard";

/** Horizontal snap-scroller on mobile, 4-up grid on desktop. */
export function ProductRail({ title, href, products, eyebrow }: { title: string; href?: string; products: Product[]; eyebrow?: string }) {
  if (!products.length) return null;
  return (
    <section className="container-page mt-16 sm:mt-20" aria-label={title}>
      <SectionHeading title={title} href={href} eyebrow={eyebrow} />
      <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0" role="list">
        {products.slice(0, 8).map((p) => (
          <li key={p.id} className="flex w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-auto [&>article]:flex-1">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
