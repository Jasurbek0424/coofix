import { t } from "@/i18n";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <div className="container-page pt-12">
      <EmptyState icon="search" title={t("errors.notFoundTitle")} text={t("errors.notFoundText")} action={<div className="flex gap-3"><ButtonLink href="/">{t("errors.toHome")}</ButtonLink><ButtonLink href="/catalog" variant="outline">{t("common.catalog")}</ButtonLink></div>} />
    </div>
  );
}
