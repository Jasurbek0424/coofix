import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/api/client";
import { t } from "@/i18n/ru";

export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <AlertTriangleIcon className="size-6 text-destructive" />
      <p className="text-sm font-medium">{t.common.loadError}</p>
      <p className="text-[13px] text-muted-foreground">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}
