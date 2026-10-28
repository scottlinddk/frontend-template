import { NavLink, Outlet } from "react-router";

import { useAuth } from "@/shared/auth";
import { Button } from "@/shared/ui";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "font-semibold text-brand-700" : "text-slate-600 hover:text-slate-900";

export function RootLayout() {
  const { status, user, signIn, signOut } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4">
      <header className="flex items-center justify-between py-4">
        <nav className="flex gap-4">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/items" className={linkClass}>
            Items
          </NavLink>
        </nav>
        {status === "authenticated" ? (
          <div className="flex items-center gap-3 text-sm">
            <span>{user?.name}</span>
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button onClick={() => void signIn()}>Sign in</Button>
        )}
      </header>
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
