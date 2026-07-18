import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import type { PovDirection, PovNode } from "@/data/destinations";

type Props = {
  node: PovNode;
  onMove: (dir: PovDirection) => void;
  disabled?: boolean;
};

const ORDER: { dir: PovDirection; Icon: typeof ArrowUp; label: string }[] = [
  { dir: "forward", Icon: ArrowUp, label: "Forward" },
  { dir: "left", Icon: ArrowLeft, label: "Left" },
  { dir: "back", Icon: ArrowDown, label: "Back" },
  { dir: "right", Icon: ArrowRight, label: "Right" },
];

export function PovControls({ node, onMove, disabled }: Props) {
  const available = ORDER.filter((o) => Boolean(node.links[o.dir]));
  if (!available.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto grid grid-cols-3 gap-2 rounded-2xl border border-white/20 bg-black/45 p-2 backdrop-blur-md">
        <div />
        <DirButton
          dir="forward"
          node={node}
          onMove={onMove}
          disabled={disabled}
          Icon={ArrowUp}
          label="Forward"
        />
        <div />
        <DirButton
          dir="left"
          node={node}
          onMove={onMove}
          disabled={disabled}
          Icon={ArrowLeft}
          label="Left"
        />
        <DirButton
          dir="back"
          node={node}
          onMove={onMove}
          disabled={disabled}
          Icon={ArrowDown}
          label="Back"
        />
        <DirButton
          dir="right"
          node={node}
          onMove={onMove}
          disabled={disabled}
          Icon={ArrowRight}
          label="Right"
        />
      </div>
    </div>
  );
}

function DirButton({
  dir,
  node,
  onMove,
  disabled,
  Icon,
  label,
}: {
  dir: PovDirection;
  node: PovNode;
  onMove: (dir: PovDirection) => void;
  disabled?: boolean;
  Icon: typeof ArrowUp;
  label: string;
}) {
  const linked = Boolean(node.links[dir]);
  if (!linked) {
    return <div className="h-11 w-11" />;
  }
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => onMove(dir)}
      className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white transition hover:bg-white/30 disabled:opacity-40"
    >
      <Icon size={18} />
    </button>
  );
}
