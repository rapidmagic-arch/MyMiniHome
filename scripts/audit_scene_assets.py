#!/usr/bin/env python3
"""Read-only MyMiniHome scene asset inventory. Never deletes or modifies files."""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCENE = ROOT / "scenes" / "forest-village-v1" / "index.html"
BASE = SCENE.parent
TEXT = SCENE.read_text(encoding="utf-8")
MATCH = re.search(r'<script id="scene" type="application/json">\s*(.*?)\s*</script>', TEXT, re.S)
if not MATCH:
    raise SystemExit("FAIL: scene JSON is missing")
scene = json.loads(MATCH.group(1))
seen = {}

def require(name: str, category: str):
    candidate = (BASE / name).resolve()
    if ROOT not in candidate.parents:
        raise ValueError("Asset path escapes repository: " + name)
    relative = candidate.relative_to(ROOT).as_posix()
    seen[relative] = category
    return candidate.is_file()

require(scene["background"], "background")
for actor in scene["characters"]:
    actor_id = actor["id"]
    for n in range(1, 7):
        require(f"../../assets/review/v0.2/frames/{actor_id}/{actor_id}_{n:02d}.png", "gesture")
    if actor.get("patrol"):
        for direction in ("left", "right"):
            for n in range(1, 7):
                require(f"../../assets/review/walk-v0.1/frames/{actor_id}/{actor_id}_walk_{direction}_{n:02d}.png", "walk")
require("../../assets/review/walk-v0.1/MANIFEST.json", "walk-manifest")

missing = sorted(p for p in seen if not (ROOT / p).is_file())
inventory = Counter(seen.values())
active = sorted(seen)
all_assets = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "assets").rglob("*") if p.is_file())
unused = sorted(set(all_assets) - set(active))
report = {
    "scene": SCENE.relative_to(ROOT).as_posix(),
    "status": scene["status"],
    "character_count": len(scene["characters"]),
    "hotspot_count": len(scene["hotspots"]),
    "active_count": len(active),
    "active_by_category": dict(sorted(inventory.items())),
    "missing": missing,
    "inactive_asset_count": len(unused),
    "inactive_sample": unused[:12],
    "policy": "READ_ONLY; inactive does NOT mean safe to delete; visual approval and references required",
}
print(json.dumps(report, indent=2, ensure_ascii=False))
sys.exit(1 if missing else 0)
