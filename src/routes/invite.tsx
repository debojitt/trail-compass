import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout for /invite and /invite/$code — children render via Outlet. */
export const Route = createFileRoute("/invite")({
  component: () => <Outlet />,
});
