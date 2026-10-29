import { Outlet } from "react-router";

import { RequireAuth } from "./RequireAuth";

/** Layout route: everything nested under it requires a signed-in user. */
export function ProtectedRoute() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
