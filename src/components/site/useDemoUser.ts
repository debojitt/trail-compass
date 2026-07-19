import { useEffect, useState } from "react";
import { getUser, subscribeDemoStore, type DemoUser } from "@/lib/demoApi";

/** Reactive demo user — updates on sign-in/out anywhere in the app */
export function useDemoUser(): DemoUser | null {
  const [user, setUser] = useState<DemoUser | null>(null);
  useEffect(() => {
    setUser(getUser());
    return subscribeDemoStore(() => setUser(getUser()));
  }, []);
  return user;
}
