import Link from "next/link";
import type { ProductCard as Product } from "@/lib/api/types";
import { discountPercent } from "@/lib/format";
import { t } from "@/i18n";
import { Badge, Price, StockBadge } from "@/components/ui/misc";
import { ProductImage } from "./ProductImage";
import { AddToCartButton, CompareButton, FavoriteButton } from "./ProductActions";

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const pct = discountPercent(product.price_minor, product.old_price_minor);
  if (!pct && !product.is_hit && !product.is_new) return null;
  return (
    <div className={className ?? "pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5"}>
      {pct && <Badge tone="sale">{t("product.badgeSale", { n: pct })}</Badge>}
      {product.is_hit && <Badge tone="brand">{t("product.badgeHit")}</Badge>}
      {product.is_new && <Badge tone="dark">{t("product.badgeNew")}</Badge>}
    </div>
  );
}

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const href = `/product/${product.slug}`;
  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:border-line-strong hover:shadow-md">
      <div className="relative">
        <ProductImage
          image={product.image}
          alt={product.name}
          priority={priority}
          className="aspect-square transition-transform duration-500 ease-out [&_img]:transition-transform [&_img]:duration-500 group-hover/card:[&_img]:scale-[1.04]"
        />
        <ProductBadges product={product} />
        <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-1.5">
          <FavoriteButton product={product} />
          <CompareButton productId={product.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex min-h-4 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {product.brand && <span className="truncate">{product.brand.name}</span>}
          {product.brand && product.sku && <span aria-hidden="true">·</span>}
          {product.sku && <span className="truncate normal-case tracking-normal">{product.sku}</span>}
        </div>
        <h3 className="line-clamp-2 min-h-[2.6em] text-[14px] font-medium leading-[1.3] text-ink sm:text-[15px]">
          <Link href={href} className="after:absolute after:inset-0 after:z-0 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-brand">
            {product.name}
          </Link>
        </h3>
        <StockBadge level={product.stock_level} className="mt-2" />
        <div className="mt-auto pt-3">
          <Price price={product.price_minor} old={product.old_price_minor} size="md" className="mb-3" />
          <div className="relative z-10">
            <AddToCartButton product={product} size="sm" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" role="list">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <div className="flex w-full flex-col [&>article]:flex-1">
            <ProductCard product={p} priority={i < priorityCount} />
          </div>
        </li>
      ))}
    </ul>
  );
}
