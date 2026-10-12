import Link from "next/link";
import { PHONES } from "@/lib/site";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle, type Theme } from "./ThemeToggle";

export function TopBar({ theme }: { theme: Theme }) {
  return (
    <div className="hidden bg-coal text-[13px] text-white/70 lg:block">
      <div className="container-page flex h-9 items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><Icon name="store" className="size-4 text-brand" />{t("header.pickupNote")}</span>
          <span className="flex items-center gap-1.5"><Icon name="clock" className="size-4" />{t("header.workingHours")}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/delivery" className="hover:text-white">{t("header.delivery")}</Link>
          <Link href="/wholesale" className="hover:text-white">{t("header.wholesale")}</Link>
          <Link href="/contacts" className="hover:text-white">{t("header.contacts")}</Link>
          <a href={PHONES[0].href} className="font-semibold text-white tabular hover:text-brand">{PHONES[0].display}</a>
          <ThemeToggle initial={theme} />
        </div>
      </div>
    </div>
  );
}
