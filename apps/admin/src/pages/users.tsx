import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { BanIcon, CheckCircle2Icon, Loader2Icon, MoreHorizontalIcon, ShieldIcon, UserPlusIcon, UsersIcon, WandSparklesIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, fieldErrors } from "@/api/client";
import { useCreateStaff, usePatchUser, useUsers } from "@/api/hooks";
import type { Role, UserAdmin } from "@/api/types";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, StopPropagation } from "@/components/common/data-table";
import { FormField } from "@/components/common/form-field";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUrlFilters } from "@/hooks/use-search-params-state";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { formatDate, formatPhone, formatRelative, fullName } from "@/lib/format";
import { STAFF_ROLES } from "@/lib/permissions";

const PER_PAGE = 25;
const FILTERS = ["q", "role"] as const;
const ALL_ROLES: Role[] = ["customer", ...STAFF_ROLES];

const ROLE_VARIANT: Record<Role, BadgeVariant> = {
  customer: "outline",
  support: "info",
  content: "secondary",
  manager: "warning",
  admin: "default",
};

type Pending = { user: UserAdmin; role?: Role; is_active?: boolean } | null;

export default function UsersPage() {
  const { user: me, can } = useAuth();
  const canManage = can("staff.manage");
  const { values: f, set, reset, page } = useUrlFilters(FILTERS);
  const q = useUsers({ q: f.q, role: f.role as Role | undefined, page, per_page: PER_PAGE });
  const patch = usePatchUser();
  const [pending, setPending] = useState<Pending>(null);
  const [staffOpen, setStaffOpen] = useState(false);

  const columns = useMemo<ColumnDef<UserAdmin>[]>(() => {
    const cols: ColumnDef<UserAdmin>[] = [
      {
        id: "user",
        header: t.users.colUser,
        cell: ({ row: { original: u } }) => (
          <div className="flex min-w-48 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground uppercase">
              {(u.first_name[0] ?? "") + (u.last_name?.[0] ?? "")}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate font-medium">
                {fullName(u)}
                {u.id === me?.id && <Badge variant="outline">{t.users.you}</Badge>}
              </div>
              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "phone",
        header: t.users.colPhone,
        meta: { className: "hidden lg:table-cell whitespace-nowrap text-muted-foreground" },
        cell: ({ row }) => formatPhone(row.original.phone),
      },
      {
        id: "role",
        header: t.users.colRole,
        cell: ({ row }) => <Badge variant={ROLE_VARIANT[row.original.role]}>{t.roles[row.original.role]}</Badge>,
      },
      {
        id: "status",
        header: t.users.colStatus,
        meta: { className: "hidden sm:table-cell" },
        cell: ({ row }) =>
          row.original.is_active ? (
            <span className="inline-flex items-center gap-1 text-[13px] text-success">
              <CheckCircle2Icon className="size-3.5" />
              {t.users.activeStatus}
            </span>
          ) : (
            <Badge variant="destructive">
              <BanIcon />
              {t.users.blocked}
            </Badge>
          ),
      },
      {
        id: "created",
        header: t.users.colCreated,
        meta: { className: "hidden md:table-cell whitespace-nowrap text-muted-foreground" },
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "login",
        header: t.users.colLastLogin,
        meta: { className: "hidden xl:table-cell whitespace-nowrap text-muted-foreground" },
        cell: ({ row }) => formatRelative(row.original.last_login_at),
      },
    ];
    if (canManage) {
      cols.push({
        id: "actions",
        header: () => <span className="sr-only">{t.common.actions}</span>,
        size: 48,
        cell: ({ row: { original: u } }) =>
          u.id === me?.id ? null : (
            <StopPropagation className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label={t.common.actions}>
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ShieldIcon />
                      {t.users.changeRole}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuLabel>{t.users.role}</DropdownMenuLabel>
                      {ALL_ROLES.map((r) => (
                        <DropdownMenuItem key={r} disabled={r === u.role} onSelect={() => setPending({ user: u, role: r })}>
                          {t.roles[r]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  {u.is_active ? (
                    <DropdownMenuItem variant="destructive" onSelect={() => setPending({ user: u, is_active: false })}>
                      <BanIcon />
                      {t.users.deactivate}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => setPending({ user: u, is_active: true })}>
                      <CheckCircle2Icon />
                      {t.users.activate}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </StopPropagation>
          ),
      });
    }
    return cols;
  }, [canManage, me?.id]);

  const confirmText = pending
    ? pending.role
      ? { title: t.users.roleTitle, desc: `${fullName(pending.user)}: ${t.roles[pending.user.role]} → ${t.roles[pending.role]}. ${t.users.roleText}`, label: t.common.confirm, destructive: false }
      : pending.is_active === false
        ? { title: t.users.deactivateTitle, desc: `${fullName(pending.user)} (${pending.user.email}). ${t.users.deactivateText}`, label: t.users.deactivate, destructive: true }
        : { title: t.users.activate, desc: `${fullName(pending.user)} (${pending.user.email})`, label: t.users.activate, destructive: false }
    : null;

  return (
    <>
      <PageHeader
        title={t.users.title}
        description={q.data ? `${t.common.total}: ${q.data.total}` : t.users.subtitle}
        actions={
          canManage && (
            <Button onClick={() => setStaffOpen(true)}>
              <UserPlusIcon />
              {t.users.newStaff}
            </Button>
          )
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <SearchInput value={f.q ?? ""} onChange={(v) => set({ q: v })} placeholder={t.users.searchPlaceholder} className="w-full sm:w-72" />
          <Select value={f.role ?? "all"} onValueChange={(v) => set({ role: v === "all" ? undefined : v })}>
            <SelectTrigger className="w-full sm:w-48" aria-label={t.users.colRole}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.users.allRoles}</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {t.roles[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(f.q || f.role) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <XIcon />
              {t.common.reset}
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          data={q.data?.items}
          isLoading={q.isLoading}
          isFetching={q.isFetching}
          error={q.error}
          onRetry={() => void q.refetch()}
          page={page}
          perPage={PER_PAGE}
          total={q.data?.total}
          onPage={(p) => set({ page: String(p) })}
          getRowId={(u) => String(u.id)}
          empty={{ icon: UsersIcon, title: t.users.empty }}
        />
      </Card>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={confirmText?.title}
        description={confirmText?.desc}
        confirmLabel={confirmText?.label}
        destructive={confirmText?.destructive}
        onConfirm={async () => {
          if (!pending) return;
          const data = pending.role ? { role: pending.role } : { is_active: pending.is_active };
          await patch.mutateAsync({ id: pending.user.id, data });
          toast.success(t.users.updated);
        }}
      />
      {canManage && <StaffDialog open={staffOpen} onOpenChange={setStaffOpen} />}
    </>
  );
}

// ---------- create staff ----------

const staffSchema = z.object({
  first_name: z.string().trim().min(1, t.validation.required).max(80, t.validation.max(80)),
  last_name: z.string().trim().max(80, t.validation.max(80)),
  email: z.string().trim().min(1, t.validation.required).email(t.validation.email),
  password: z.string().min(12, t.validation.min12).max(128, t.validation.max(128)),
  role: z.enum(STAFF_ROLES),
});
type StaffValues = z.infer<typeof staffSchema>;

function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_!@#";
  const bytes = crypto.getRandomValues(new Uint32Array(18));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function StaffDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateStaff();
  const defaults: StaffValues = { first_name: "", last_name: "", email: "", password: "", role: "manager" };
  const form = useForm<StaffValues>({ resolver: zodResolver(staffSchema), defaultValues: defaults });
  const { errors, isSubmitting } = form.formState;

  const close = (o: boolean) => {
    if (!o) form.reset(defaults);
    onOpenChange(o);
  };

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await create.mutateAsync({ ...v, last_name: v.last_name || null });
      toast.success(t.users.staffCreated);
      close(false);
    } catch (e) {
      if (!(e instanceof ApiError)) return;
      if (e.code === "email_taken") form.setError("email", { message: e.userMessage }, { shouldFocus: true });
      for (const [path, msg] of Object.entries(fieldErrors(e))) {
        const root = path.split(".")[0] as keyof StaffValues;
        if (root in defaults) form.setError(root, { message: msg });
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{t.users.staffTitle}</DialogTitle>
            <DialogDescription>{t.users.staffDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t.users.firstName} required error={errors.first_name?.message}>
              <Input {...form.register("first_name")} autoFocus />
            </FormField>
            <FormField label={t.users.lastName} error={errors.last_name?.message}>
              <Input {...form.register("last_name")} />
            </FormField>
          </div>
          <FormField label={t.users.email} required error={errors.email?.message}>
            <Input type="email" autoComplete="off" {...form.register("email")} />
          </FormField>
          <FormField
            label={t.users.password}
            required
            error={errors.password?.message}
            hint={t.users.passwordHint}
            labelAction={
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                onClick={() => form.setValue("password", generatePassword(), { shouldValidate: true })}
              >
                <WandSparklesIcon className="size-3" />
                {t.users.generate}
              </button>
            }
          >
            <Input type="text" autoComplete="new-password" spellCheck={false} className="font-mono" {...form.register("password")} />
          </FormField>
          <FormField label={t.users.role} required error={errors.role?.message}>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t.roles[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => close(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {t.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
