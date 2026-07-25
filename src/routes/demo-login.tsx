import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { openSignInDialog } from "@/components/site/SignInButton";
import { dashboardPathFor, getUser } from "@/lib/demoApi";

/** Retired demo-login page — Sign-in dialog is the only account picker. */
export const Route = createFileRoute("/demo-login")({
  head: () => ({ meta: [{ title: "Sign in · NORTHNEST" }] }),
  component: DemoLoginRedirect,
});

function DemoLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = getUser();
    if (user) {
      window.location.href = dashboardPathFor(user.type);
      return;
    }
    openSignInDialog();
    void navigate({ to: "/" });
  }, [navigate]);
  return (
    <div className="grid min-h-screen place-items-center bg-white text-[14px] text-neutral-500">
      Opening sign-in…
    </div>
  );
}
