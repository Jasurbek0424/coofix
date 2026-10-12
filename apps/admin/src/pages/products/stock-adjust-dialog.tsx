import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MinusIcon, PlusIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError } from "@/api/client";
import { useAdjustStock } from "@/api/hooks";
import type { Product } from "@/api/types";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

const schema = z.object({
  delta: z
    .string()
    .trim()
    .regex(/^[+-]?\d{1,7}$/, t.validation.int)
    .refine((s) => Number(s) !== 0, t.validation.nonZero),
  reason: z.string().trim().min(1, t.validation.required).max(300, t.validation.max(300)),
});
type Values = z.infer<typeof schema>;

export function StockAdjustDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (o: boolean) => void; product: Product }) {
  const adjust = useAdjustStock();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { delta: "", reason: "" } });
  const { errors, isSubmitting } = form.formState;
  const deltaRaw = useWatch({ control: form.control, name: "delta" });
  const delta = /^[+-]?\d{1,7}$/.test(deltaRaw?.trim() ?? "") ? Number(deltaRaw) : 0;
  const result = product.stock + delta;

  const step = (n: number) => {
    const next = delta + n;
    form.setValue("delta", next > 0 ? `+${next}` : String(next), { shouldValidate: form.formState.isSubmitted });
  };

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await adjust.mutateAsync({ id: product.id, delta: Number(v.delta), reason: v.reason });
      toast.success(t.stock.done);
      form.reset();
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError && e.code === "negative_stock") form.setError("delta", { message: e.userMessage });
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) form.reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.stock.title}</DialogTitle>
          <DialogDescription>{t.stock.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid grid-cols-3 items-center gap-2 rounded-md border bg-muted/30 p-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground">{t.products.stockCurrent}</div>
              <div className="text-lg font-semibold tabular">{product.stock}</div>
            </div>
            <div className={cn("text-lg font-semibold tabular", delta > 0 && "text-success", delta < 0 && "text-destructive")}>
              {delta > 0 ? `+${delta}` : delta}
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.stock.result}</div>
              <div className={cn("text-lg font-semibold tabular", result < 0 && "text-destructive")}>{result}</div>
            </div>
          </div>
          <FormField label={t.stock.delta} required error={errors.delta?.message ?? (result < 0 ? t.errors.negative_stock : undefined)}>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label="-1">
                <MinusIcon />
              </Button>
              <Input {...form.register("delta")} inputMode="numeric" placeholder="+10 / -3" className="text-center tabular" autoFocus />
              <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="+1">
                <PlusIcon />
              </Button>
            </div>
          </FormField>
          <FormField label={t.stock.reason} required error={errors.reason?.message}>
            <Input {...form.register("reason")} placeholder={t.stock.reasonPlaceholder} maxLength={300} />
          </FormField>
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {t.stock.quickReasons.map((r) => (
              <button
                key={r}
                type="button"
                className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => form.setValue("reason", r, { shouldValidate: true })}
              >
                {r}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting || result < 0}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {t.stock.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
