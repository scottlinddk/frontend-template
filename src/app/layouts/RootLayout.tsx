import { NavLink, Outlet } from "react-router";

import { LanguageSwitcher, useI18n } from "@/i18n";
import { useAuth } from "@/shared/auth";
import { ThemeToggle } from "@/shared/theme";
import { Button } from "@/shared/ui";

import { RouteProgress } from "./RouteProgress";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "font-semibold text-brand-600" : "text-ink-muted hover:text-ink";

export function RootLayout() {
  const { status, user, signIn, signOut } = useAuth();
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4">
      <RouteProgress />
      <header className="flex flex-wrap items-center justify-between gap-3 py-4">
        <nav className="flex gap-4">
          <NavLink to="/" end viewTransition className={linkClass}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/items" viewTransition className={linkClass}>
            {t("nav.items")}
          </NavLink>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <LanguageSwitcher />
          <ThemeToggle />
          {status === "authenticated" ? (
            <>
              <span>{user?.name}</span>
              <Button variant="secondary" onClick={() => void signOut()}>
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Button onClick={() => void signIn()}>{t("nav.signIn")}</Button>
          )}
        </div>
      </header>
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
