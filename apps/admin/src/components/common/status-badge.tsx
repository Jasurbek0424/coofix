import type { OrderStatus, PaymentStatus } from "@/api/types";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

const ORDER: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "muted",
};

const PAYMENT: Record<PaymentStatus, BadgeVariant> = {
  unpaid: "outline",
  pending: "warning",
  paid: "success",
  refunded: "muted",
  failed: "destructive",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge variant={ORDER[status]} className={className}>
      <span className={cn("size-1.5 rounded-full bg-current")} />
      {t.orderStatus[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Badge variant={PAYMENT[status]} className={className}>
      {t.paymentStatus[status]}
    </Badge>
  );
}
