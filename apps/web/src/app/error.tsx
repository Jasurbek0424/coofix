"use client";

import { t } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/misc";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page pt-12">
      <EmptyState icon="alert" title={t("errors.serverTitle")} text={t("errors.serverText")} action={<Button onClick={reset}>{t("common.retry")}</Button>} />
    </div>
  );
}
