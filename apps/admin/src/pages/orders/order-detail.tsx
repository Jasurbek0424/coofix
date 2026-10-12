import { CheckIcon, CircleIcon, Loader2Icon, MailIcon, PhoneIcon, TruckIcon, XCircleIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useOrderTransition, usePatchOrder } from "@/api/hooks";
import { ORDER_TRANSITIONS, PAYMENT_STATUSES, type Order, type OrderStatus, type PaymentStatus } from "@/api/types";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { formatDateTime, formatPhone } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("grid gap-2.5", className)}>
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

const TRANSITION_ICON: Partial<Record<OrderStatus, typeof CheckIcon>> = { confirmed: CheckIcon, shipped: TruckIcon, delivered: CheckIcon };

export function OrderDetail({ order }: { order: Order }) {
  const { can } = useAuth();
  const canWrite = can("orders.write");
  const transition = useOrderTransition();
  const patch = usePatchOrder();
  const [note, setNote] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pendingTo, setPendingTo] = useState<OrderStatus | null>(null);
  const [staffNote, setStaffNote] = useState(order.staff_note ?? "");
  const [lastSavedNote, setLastSavedNote] = useState(order.staff_note ?? "");
  if ((order.staff_note ?? "") !== lastSavedNote) {
    // Server copy changed (refetch/other tab) → adopt it.
    setLastSavedNote(order.staff_note ?? "");
    setStaffNote(order.staff_note ?? "");
  }

  const next = ORDER_TRANSITIONS[order.status];
  const forward = next.filter((s) => s !== "cancelled");

  const doTransition = async (to: OrderStatus) => {
    setPendingTo(to);
    try {
      await transition.mutateAsync({ id: order.id, status: to, note: note.trim() || undefined });
      toast.success(`${t.orders.statusChanged}: ${t.orderStatus[to]}`);
      setNote("");
    } finally {
      setPendingTo(null);
    }
  };

  const events = [...order.events].sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="grid gap-6">
      {/* status + actions */}
      <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} className="text-[13px]" />
          <PaymentStatusBadge status={order.payment_status} className="text-[13px]" />
          <span className="ml-auto text-lg font-semibold tabular">{formatMoney(order.total_minor)}</span>
        </div>
        {canWrite &&
          (next.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">{t.orders.noTransitions}</p>
          ) : (
            <>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`${t.orders.transitionNote} (${t.common.optional})`}
                rows={2}
                maxLength={1000}
                className="min-h-0 bg-card"
              />
              <div className="flex flex-wrap gap-2">
                {forward.map((s) => {
                  const Icon = TRANSITION_ICON[s] ?? CircleIcon;
                  return (
                    <Button key={s} size="sm" onClick={() => void doTransition(s).catch(() => undefined)} disabled={transition.isPending}>
                      {pendingTo === s ? <Loader2Icon className="animate-spin" /> : <Icon />}
                      {t.orders.moveTo} «{t.orderStatus[s]}»
                    </Button>
                  );
                })}
                {next.includes("cancelled") && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => setCancelOpen(true)} disabled={transition.isPending}>
                    <XCircleIcon />
                    {t.orders.cancelConfirm}
                  </Button>
                )}
              </div>
            </>
          ))}
      </div>

      <Section title={t.orders.items}>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">{t.products.colProduct}</th>
                <th className="px-3 py-2 text-right font-medium">{t.orders.qty}</th>
                <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{t.orders.unitPrice}</th>
                <th className="px-3 py-2 text-right font-medium">{t.orders.lineTotal}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">
                    {it.product_id && can("catalog.write") ? (
                      <Link to={`/products/${it.product_id}`} className="font-medium hover:text-primary hover:underline">
                        {it.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{it.name}</span>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {it.sku && <span className="font-mono">{it.sku}</span>}
                      {!it.product_id && <span> · {t.orders.deletedProduct}</span>}
                      <span className="sm:hidden"> · {formatMoney(it.unit_price_minor)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular">{it.quantity}</td>
                  <td className="hidden px-3 py-2 text-right tabular sm:table-cell">{formatMoney(it.unit_price_minor)}</td>
                  <td className="px-3 py-2 text-right font-medium tabular">{formatMoney(it.line_total_minor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/20 tabular">
              <tr>
                <td colSpan={2} className="px-3 pt-2 text-muted-foreground">
                  {t.orders.subtotal}
                </td>
                <td className="hidden sm:table-cell" />
                <td className="px-3 pt-2 text-right">{formatMoney(order.subtotal_minor)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="px-3 text-muted-foreground">
                  {t.orders.delivery}
                </td>
                <td className="hidden sm:table-cell" />
                <td className="px-3 text-right">{formatMoney(order.delivery_minor)}</td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={2} className="px-3 pb-2">
                  {t.orders.total}
                </td>
                <td className="hidden sm:table-cell" />
                <td className="px-3 pb-2 text-right">{formatMoney(order.total_minor)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title={t.orders.customer}>
          <Row label={t.orders.customer}>
            <span className="font-medium">{order.customer_name}</span>
            <span className="ml-1 text-xs text-muted-foreground">{order.user_id ? `${t.orders.userAccount}${order.user_id}` : `(${t.orders.guest})`}</span>
          </Row>
          <Row label={t.orders.phone}>
            <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
              <PhoneIcon className="size-3.5" />
              {formatPhone(order.phone)}
            </a>
          </Row>
          {order.email && (
            <Row label={t.orders.email}>
              <a href={`mailto:${order.email}`} className="inline-flex items-center gap-1 break-all hover:text-primary">
                <MailIcon className="size-3.5 shrink-0" />
                {order.email}
              </a>
            </Row>
          )}
          {order.comment && (
            <Row label={t.orders.comment}>
              <span className="whitespace-pre-wrap">{order.comment}</span>
            </Row>
          )}
        </Section>
        <Section title={t.orders.delivery}>
          <Row label={t.orders.deliveryMethod}>{t.deliveryMethod[order.delivery_method]}</Row>
          {order.address && <Row label={t.orders.address}>{order.address}</Row>}
          <Row label={t.orders.paymentMethod}>{t.paymentMethod[order.payment_method]}</Row>
          <div className="grid grid-cols-[130px_1fr] items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">{t.orders.paymentStatus}</span>
            {canWrite ? (
              <Select
                value={order.payment_status}
                onValueChange={(v) =>
                  patch.mutate(
                    { id: order.id, data: { payment_status: v as PaymentStatus } },
                    { onSuccess: () => toast.success(t.orders.paymentUpdated) },
                  )
                }
                disabled={patch.isPending}
              >
                <SelectTrigger className="h-8 w-full max-w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t.paymentStatus[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <PaymentStatusBadge status={order.payment_status} />
            )}
          </div>
        </Section>
      </div>

      <Section title={t.orders.staffNote}>
        <Label htmlFor={`note-${order.id}`} className="sr-only">
          {t.orders.staffNote}
        </Label>
        <Textarea
          id={`note-${order.id}`}
          value={staffNote}
          onChange={(e) => setStaffNote(e.target.value)}
          placeholder={t.orders.staffNotePlaceholder}
          rows={3}
          maxLength={5000}
          disabled={!canWrite}
        />
        {canWrite && staffNote !== (order.staff_note ?? "") && (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStaffNote(order.staff_note ?? "")}>
              {t.common.cancel}
            </Button>
            <Button
              size="sm"
              disabled={patch.isPending}
              onClick={() =>
                patch.mutate(
                  { id: order.id, data: { staff_note: staffNote.trim() || null } },
                  { onSuccess: () => toast.success(t.orders.noteSaved) },
                )
              }
            >
              {patch.isPending && <Loader2Icon className="animate-spin" />}
              {t.orders.saveNote}
            </Button>
          </div>
        )}
      </Section>

      <Section title={t.orders.timeline}>
        <ol className="relative grid gap-4 border-l pl-5">
          <TimelineItem status="pending" title={t.orders.created} at={order.created_at} />
          {events
            .filter((e) => e.from_status !== null)
            .map((e, i) => (
              <TimelineItem
                key={i}
                status={e.to_status as OrderStatus}
                title={
                  <>
                    {e.from_status && <span className="text-muted-foreground">{t.orderStatus[e.from_status as OrderStatus] ?? e.from_status} → </span>}
                    {t.orderStatus[e.to_status as OrderStatus] ?? e.to_status}
                  </>
                }
                note={e.note}
                at={e.created_at}
              />
            ))}
        </ol>
      </Section>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t.orders.cancelTitle}
        description={t.orders.cancelText}
        confirmLabel={t.orders.cancelConfirm}
        onConfirm={() => doTransition("cancelled")}
      />
    </div>
  );
}

const DOT: Record<OrderStatus, string> = {
  pending: "bg-warning",
  confirmed: "bg-info",
  shipped: "bg-primary",
  delivered: "bg-success",
  cancelled: "bg-muted-foreground",
};

function TimelineItem({ status, title, note, at }: { status: OrderStatus; title: ReactNode; note?: string | null; at: string }) {
  return (
    <li className="relative">
      <span className={cn("absolute top-1 -left-[25px] size-2.5 rounded-full ring-4 ring-background", DOT[status] ?? "bg-muted-foreground")} />
      <div className="text-[13px] font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{formatDateTime(at)}</div>
      {note && <p className="mt-1 rounded-md bg-muted/50 px-2.5 py-1.5 text-[13px] whitespace-pre-wrap">{note}</p>}
    </li>
  );
}
