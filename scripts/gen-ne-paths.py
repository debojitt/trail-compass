import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
svg_path = Path.home() / "AppData/Local/Temp/svg-maps-india-extract/package/india.svg"
svg = svg_path.read_text(encoding="utf-8")

ids = ["ar", "as", "mn", "ml", "mz", "nl", "sk", "tr"]
raw = {}
for sid in ids:
    m = re.search(
        rf'<path\s+id="{sid}"\s+aria-label="([^"]+)"\s+d="([^"]+)"\s*/>',
        svg,
    )
    if not m:
        raise SystemExit(f"missing {sid}")
    raw[sid] = {"label": m.group(1), "d": m.group(2)}

slug = {
    "ar": "arunachal-pradesh",
    "as": "assam",
    "ml": "meghalaya",
    "nl": "nagaland",
    "mn": "manipur",
    "mz": "mizoram",
    "tr": "tripura",
    "sk": "sikkim",
}
label = {
    "ar": "ARUNĀCHAL PRADESH",
    "as": "ASSAM",
    "ml": "MEGHĀLAYA",
    "nl": "NĀGĀLAND",
    "mn": "MANIPUR",
    "mz": "MIZORĀM",
    "tr": "TRIPURA",
    "sk": "SIKKIM",
}
centers = {
    "ar": (550, 222, -18),
    "as": (510, 268, 0),
    "ml": (482, 282, 0),
    "nl": (545, 268, -28),
    "mn": (537, 300, 0),
    "mz": (516, 335, 0),
    "tr": (492, 325, -65),
    "sk": (424, 235, 0),
}
font_sizes = {
    "ar": 5.2,
    "as": 5.5,
    "ml": 5.5,
    "nl": 4.6,
    "mn": 4.6,
    "mz": 4.6,
    "tr": 4.4,
    "sk": 4.2,
}

out = ROOT / "src/data/neIndiaPaths.ts"
lines = [
    "/** Paths adapted from @svg-maps/india (CC BY 4.0). */",
    "export type NeStateId =",
    '  | "arunachal-pradesh"',
    '  | "assam"',
    '  | "meghalaya"',
    '  | "nagaland"',
    '  | "manipur"',
    '  | "mizoram"',
    '  | "tripura"',
    '  | "sikkim";',
    "",
    "export type NeStatePath = {",
    "  id: NeStateId;",
    "  mapId: string;",
    "  d: string;",
    "  label: string;",
    "  cx: number;",
    "  cy: number;",
    "  rotate: number;",
    "  fontSize: number;",
    "};",
    "",
    'export const NE_INDIA_VIEWBOX = "405 182 220 195";',
    "",
    "export const NE_STATE_PATHS: NeStatePath[] = [",
]

for sid in ["sk", "ar", "as", "ml", "nl", "mn", "tr", "mz"]:
    cx, cy, rot = centers[sid]
    d = json.dumps(raw[sid]["d"])
    lines.append("  {")
    lines.append(f'    id: "{slug[sid]}",')
    lines.append(f'    mapId: "{sid}",')
    lines.append(f"    d: {d},")
    lines.append(f'    label: "{label[sid]}",')
    lines.append(f"    cx: {cx},")
    lines.append(f"    cy: {cy},")
    lines.append(f"    rotate: {rot},")
    lines.append(f"    fontSize: {font_sizes[sid]},")
    lines.append("  },")

lines.append("];")
lines.append("")
out.write_text("\n".join(lines), encoding="utf-8")
print(f"wrote {out} ({out.stat().st_size} bytes)")
print("sample:", raw["sk"]["d"][:60])
