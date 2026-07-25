import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { openSignInDialog } from "@/components/site/SignInButton";
import { dashboardPathFor, getUser } from "@/lib/demoApi";

/** Legacy /auth → open Sign-in dialog (demoApi accounts) and route to dashboard if already signed in. */
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · NORTHNEST" },
      { name: "description", content: "Sign in with a NORTHNEST role account." },
    ],
  }),
  component: AuthRedirect,
});

function AuthRedirect() {
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
