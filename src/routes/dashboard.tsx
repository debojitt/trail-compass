import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { dashboardPathFor, getUser } from "@/lib/demoApi";

/**
 * Layout for /dashboard/* role pages.
 * Only the bare /dashboard path redirects — child routes must render.
 */
export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    const path = location.pathname.replace(/\/$/, "") || "/";
    if (path !== "/dashboard") return;

    if (typeof window === "undefined") {
      throw redirect({ to: "/" });
    }
    const user = getUser();
    if (!user) {
      window.sessionStorage.setItem("nn-open-signin", "1");
      throw redirect({ to: "/" });
    }
    throw redirect({ href: dashboardPathFor(user.type) });
  },
  component: () => <Outlet />,
});
