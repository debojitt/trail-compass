import { createFileRoute, redirect } from "@tanstack/react-router";
import { dashboardPathFor, getUser } from "@/lib/demoApi";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      throw redirect({ to: "/demo-login" });
    }
    const user = getUser();
    const path = user ? dashboardPathFor(user.type) : "/demo-login";
    throw redirect({ href: path });
  },
  component: () => null,
});
