import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { api, errorMessage, setSession } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n/ru";

const MIN = 12;

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next.length < MIN) return setError(t.password.tooShort);
    if (next !== repeat) return setError(t.password.mismatch);
    setBusy(true);
    setError(null);
    try {
      await api("/admin/auth/change-password", {
        method: "POST",
        body: { current_password: current, new_password: next },
      });
      toast.success(t.password.changed);
      onOpenChange(false);
      setSession(null); // all sessions were revoked server-side
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setCurrent("");
          setNext("");
          setRepeat("");
          setError(null);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{t.password.title}</DialogTitle>
            <DialogDescription>{t.password.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="pw-current">{t.password.current}</Label>
            <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-new">{t.password.next}</Label>
            <Input id="pw-new" type="password" autoComplete="new-password" minLength={MIN} value={next} onChange={(e) => setNext(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw-repeat">{t.password.repeat}</Label>
            <Input id="pw-repeat" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} required />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? t.password.saving : t.password.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
