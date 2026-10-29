import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { useI18n } from "@/i18n";
import { HttpError } from "@/shared/lib/http";

/** Rendered by the router when a route throws or a loader rejects. */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useI18n();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t("error.title");
  const message =
    error instanceof HttpError || error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? t("error.pageLoad")
        : t("error.unexpected");

  return (
    <div role="alert" className="mx-auto max-w-md space-y-3 py-16 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-ink-muted">{message}</p>
      <Link to="/" className="inline-block text-brand-600 underline">
        {t("error.backHome")}
      </Link>
    </div>
  );
}
