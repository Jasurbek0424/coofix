import { ArrowLeftIcon } from "lucide-react";
import { Link, useParams } from "react-router";
import { ApiError } from "@/api/client";
import { useOrder } from "@/api/hooks";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { QueryError } from "@/components/common/query-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/i18n/ru";
import { formatDateTime } from "@/lib/format";
import { OrderDetail } from "./order-detail";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function OrderPage() {
  const { id } = useParams();
  const valid = !!id && UUID_RE.test(id);
  const q = useOrder(valid ? id : undefined);
  const back = (
    <Button asChild variant="ghost" size="icon-sm" className="mt-0.5" aria-label={t.common.back}>
      <Link to="/orders">
        <ArrowLeftIcon />
      </Link>
    </Button>
  );

  if (!valid || (q.error instanceof ApiError && q.error.status === 404)) return <EmptyState title={t.orders.notFound} action={back} />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={back}
        title={q.data ? `${t.orders.order} #${q.data.number}` : <Skeleton className="h-7 w-40" />}
        description={q.data ? formatDateTime(q.data.created_at) : undefined}
      />
      <Card className="p-4 sm:p-6">
        {q.data ? (
          <OrderDetail order={q.data} />
        ) : q.error ? (
          <QueryError error={q.error} onRetry={() => void q.refetch()} />
        ) : (
          <div className="grid gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        )}
      </Card>
    </div>
  );
}
