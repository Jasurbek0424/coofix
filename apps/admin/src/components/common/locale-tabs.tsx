import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/i18n/ru";
import { CONTENT_LOCALES, type Locale } from "@/lib/config";

/**
 * Wraps translatable fields. With a single enabled locale (default: ru) it renders the
 * fields directly; enabling VITE_CONTENT_LOCALES=ru,zh adds a tab per locale.
 */
export function LocaleTabs({ children, errorLocales }: { children: (locale: Locale) => ReactNode; errorLocales?: Locale[] }) {
  if (CONTENT_LOCALES.length === 1) return <>{children(CONTENT_LOCALES[0]!)}</>;
  return (
    <Tabs defaultValue={CONTENT_LOCALES[0]} className="grid gap-3">
      <TabsList>
        {CONTENT_LOCALES.map((l) => (
          <TabsTrigger key={l} value={l}>
            {t.i18n[l]}
            {errorLocales?.includes(l) && <span className="size-1.5 rounded-full bg-destructive" />}
          </TabsTrigger>
        ))}
      </TabsList>
      {CONTENT_LOCALES.map((l) => (
        <TabsContent key={l} value={l} forceMount className="grid gap-4 data-[state=inactive]:hidden">
          {children(l)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
