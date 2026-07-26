import { NE_INDIA_VIEWBOX, NE_STATE_PATHS, type NeStateId } from "@/data/neIndiaPaths";

const RED = "#E23744";
const FILL = "#2C2C2C";
const FILL_DIM = "#6B6B6B";

type Props = {
  /** State that lifts / highlights on the map */
  liftSlug: string | null;
  /** Hover/focus a state → parent selects the matching carousel card */
  onHover: (slug: NeStateId | null) => void;
  /** Click a state → open explore (or parent may treat as confirm) */
  onSelect: (slug: NeStateId) => void;
};

/**
 * Interactive NE India map. Selection is shown beside the map
 * and mirrored in the places carousel below — never overlaid on the SVG.
 */
export function NortheastMap({ liftSlug, onHover, onSelect }: Props) {
  return (
    <div
      className="nn-ne-map relative mx-auto w-full"
      onPointerLeave={(e) => {
        /* Touch taps fire leave after finger-up — keep selection so side card stays */
        if (e.pointerType === "touch") return;
        onHover(null);
      }}
    >
      <svg
        viewBox={NE_INDIA_VIEWBOX}
        className="nn-ne-map-svg block h-auto w-full overflow-visible"
        role="img"
        aria-label="Interactive map of Northeast India"
      >
        <defs>
          <filter id="nn-ne-lift-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.8" floodColor="#000" floodOpacity="0.32" />
          </filter>
        </defs>

        <text
          x="412"
          y="198"
          fill="#1a1a1a"
          fontSize="7.5"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1.4"
          className="nn-ne-map-title"
        >
          NORTHEAST INDIA
        </text>

        {NE_STATE_PATHS.map((state) => {
          const isActive = liftSlug === state.id;
          const dimmed = Boolean(liftSlug) && !isActive;
          return (
            <g
              key={state.id}
              data-state={state.id}
              className={`nn-ne-state${isActive ? " is-active" : ""}${dimmed ? " is-dimmed" : ""}`}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              filter={isActive ? "url(#nn-ne-lift-shadow)" : undefined}
              onPointerEnter={() => onHover(state.id)}
              onFocus={() => onHover(state.id)}
              onClick={() => {
                onHover(state.id);
                onSelect(state.id);
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              aria-label={`Select ${state.label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(state.id);
                }
              }}
            >
              <path
                id={state.mapId}
                d={state.d}
                fill={isActive ? RED : dimmed ? FILL_DIM : FILL}
                stroke="#fff"
                strokeWidth={1.55}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="nn-ne-state-path"
              />
              <text
                x={state.cx}
                y={state.cy}
                fill="#fff"
                fontSize={state.fontSize}
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight={600}
                letterSpacing="0.55"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${state.rotate} ${state.cx} ${state.cy})`}
                className="nn-ne-state-label pointer-events-none select-none"
              >
                {state.id === "arunachal-pradesh" ? (
                  <>
                    <tspan x={state.cx} dy="-0.55em">
                      ARUNĀCHAL
                    </tspan>
                    <tspan x={state.cx} dy="1.15em">
                      PRADESH
                    </tspan>
                  </>
                ) : (
                  state.label
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
