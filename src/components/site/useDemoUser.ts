import { useEffect, useState } from "react";
import { getUser, subscribeDemoStore, type DemoUser } from "@/lib/demoApi";

/**
 * Reactive demo user. Always starts null on first paint (SSR + hydration safe),
 * then reads localStorage after mount so dashboards don't flash/mismatch.
 */
export function useDemoUser(): DemoUser | null {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);
    return subscribeDemoStore(() => setUser(getUser()));
  }, []);

  // Expose ready via a module-level pattern for gates — consumers that need
  // "still loading auth" can check user === null && !ready by using the hook below.
  void ready;
  return user;
}

/** true after client has read the demo session from localStorage */
export function useDemoAuthReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
