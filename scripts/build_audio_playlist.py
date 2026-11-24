#!/usr/bin/env python3
"""Build a static public BGM manifest. Read-only for music files; writes playlist.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / "assets" / "audio" / "bgm"
ALLOWED = {".mp3", ".ogg", ".wav", ".m4a"}
FOLDER.mkdir(parents=True, exist_ok=True)
tracks = []
for p in sorted(FOLDER.iterdir(), key=lambda item: item.name.casefold()):
    if p.is_symlink() or not p.is_file() or p.suffix.lower() not in ALLOWED:
        continue
    tracks.append({"title": p.stem.replace("_", " ").replace("-", " "), "file": p.name})
target = FOLDER / "playlist.json"
target.write_text(json.dumps({"version": 1, "tracks": tracks}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"BGM playlist: {len(tracks)} file(s) -> {target.relative_to(ROOT)}")
