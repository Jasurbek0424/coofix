import { AlertTriangleIcon, LockIcon, SearchXIcon } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/ru";

export function ForbiddenPage() {
  return (
    <EmptyState
      icon={LockIcon}
      title={t.errors.forbiddenPage}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/">{t.errors.goHome}</Link>
        </Button>
      }
    />
  );
}

export function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title={t.errors.notFoundPage}
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/">{t.errors.goHome}</Link>
        </Button>
      }
    />
  );
}

export function ErrorPage() {
  const err = useRouteError();
  const is404 = isRouteErrorResponse(err) && err.status === 404;
  // Stale chunk after a deploy: reload once to fetch the new build.
  if (err instanceof TypeError && /dynamically imported module|Importing a module script failed/.test(err.message)) {
    if (!sessionStorage.getItem("chunk-reload")) {
      sessionStorage.setItem("chunk-reload", "1");
      window.location.reload();
    }
  }
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={is404 ? SearchXIcon : AlertTriangleIcon}
        title={is404 ? t.errors.notFoundPage : t.errors.generic}
        action={
          <Button asChild variant="outline" size="sm">
            <a href="/">{t.errors.goHome}</a>
          </Button>
        }
      />
    </div>
  );
}
