/** Tiny event helper — kept separate so CmsKit can open Sign-in without circular imports. */

const SIGNIN_EVENT = "nn-open-signin";
const SIGNIN_FLAG = "nn-open-signin";

/** Open the Sign-in dialog from anywhere (dashboards, redirects, CTAs). */
export function openSignInDialog() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SIGNIN_FLAG, "1");
  window.dispatchEvent(new Event(SIGNIN_EVENT));
}

export function consumeSignInFlag(): boolean {
  if (typeof window === "undefined") return false;
  if (window.sessionStorage.getItem(SIGNIN_FLAG) !== "1") return false;
  window.sessionStorage.removeItem(SIGNIN_FLAG);
  return true;
}

export { SIGNIN_EVENT, SIGNIN_FLAG };
