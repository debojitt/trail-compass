/** Accurate Mac-style genie minimize: horizontal strips suck into a dock target. */

export type GenieOptions = {
  /** Called as soon as strips are painted (safe to reveal next short). */
  onStarted?: () => void;
};

export function macGenieMinimize(
  sourceEl: HTMLElement,
  targetEl: HTMLElement,
  imgSrc: string,
  options?: GenieOptions,
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    options?.onStarted?.();
    return Promise.resolve();
  }

  const from = sourceEl.getBoundingClientRect();
  const to = targetEl.getBoundingClientRect();
  if (from.width < 8 || from.height < 8) {
    options?.onStarted?.();
    return Promise.resolve();
  }

  const stripCount = 32;
  const stripH = from.height / stripCount;
  const safeUrl = imgSrc.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const layer = document.createElement("div");
  layer.className = "nn-genie-layer";
  document.body.appendChild(layer);

  const targetCX = to.left + to.width * 0.5;
  const targetCY = to.top + to.height * 0.5;
  const sourceLeft = from.left;
  const sourceWidth = from.width;

  /* Mac genie: suck toward dock — strips nearer the dock lead */
  const originX = ((targetCX - from.left) / from.width) * 100;

  targetEl.classList.add("nn-playlist-pulse");
  window.setTimeout(() => targetEl.classList.remove("nn-playlist-pulse"), 1100);

  const animations: Animation[] = [];

  for (let i = 0; i < stripCount; i++) {
    const strip = document.createElement("div");
    strip.className = "nn-genie-strip";
    const top = from.top + i * stripH;
    const stripCY = top + stripH / 2;

    /* Strips closer to dock start first (classic genie lead) */
    const t = i / (stripCount - 1);
    const verticalBias = targetCY > sourceCY(from) ? t : 1 - t;
    const delay = verticalBias * 160 + (1 - Math.abs(0.5 - t) * 2) * 40;

    strip.style.left = `${sourceLeft}px`;
    strip.style.top = `${top}px`;
    strip.style.width = `${sourceWidth}px`;
    strip.style.height = `${stripH + 1.5}px`;
    strip.style.backgroundImage = `url("${safeUrl}")`;
    strip.style.backgroundSize = `${sourceWidth}px ${from.height}px`;
    strip.style.backgroundPosition = `0 ${-i * stripH}px`;
    strip.style.transformOrigin = `${originX}% 50%`;
    layer.appendChild(strip);

    const dx = targetCX - (sourceLeft + sourceWidth / 2);
    const dy = targetCY - stripCY;

    /* Progressive funnel: wide → narrow stream into dock */
    const anim = strip.animate(
      [
        {
          transform: "translate3d(0,0,0) scaleX(1) scaleY(1)",
          filter: "brightness(1) contrast(1)",
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate3d(${dx * 0.12}px, ${dy * 0.08}px, 0) scaleX(0.97) scaleY(1.02)`,
          offset: 0.12,
        },
        {
          transform: `translate3d(${dx * 0.38}px, ${dy * 0.32}px, 0) scaleX(0.55) scaleY(0.9)`,
          filter: "brightness(1.04)",
          offset: 0.38,
        },
        {
          /* Peak genie warp — thin vertical stream */
          transform: `translate3d(${dx * 0.68}px, ${dy * 0.62}px, 0) scaleX(0.16) scaleY(0.55)`,
          filter: "brightness(1.08)",
          offset: 0.62,
        },
        {
          transform: `translate3d(${dx * 0.9}px, ${dy * 0.9}px, 0) scaleX(0.05) scaleY(0.12)`,
          opacity: 0.9,
          offset: 0.85,
        },
        {
          transform: `translate3d(${dx}px, ${dy}px, 0) scaleX(0.015) scaleY(0.015)`,
          opacity: 0,
          offset: 1,
        },
      ],
      {
        duration: 780,
        delay,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      },
    );
    animations.push(anim);
  }

  /* Next short can appear immediately once genie is on-screen */
  requestAnimationFrame(() => options?.onStarted?.());

  return Promise.all(animations.map((a) => a.finished.catch(() => undefined))).then(() => {
    layer.remove();
  });
}

function sourceCY(from: DOMRect) {
  return from.top + from.height * 0.5;
}
