#!/usr/bin/env python3
"""Import the exact MyMiniHome v0.2 REVIEW zip into a local repository.
Dry-run by default. No git commit/push, app implementation, or deployment.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import sys
import zipfile
from pathlib import Path, PurePosixPath

EXPECTED_SHA256 = "9a5502a74472a942b54b58bdc5e3f89e76d8ab377bbd1edf631906d95cb0f9c7"
EXPECTED_ENTRIES = 76
ALLOWED_PREFIXES = ("concept/", "sheets/", "frames/", "previews/", "docs/")

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("zip", type=Path)
    p.add_argument("--repo", type=Path, default=Path.cwd())
    p.add_argument("--apply", action="store_true")
    a = p.parse_args()
    if not (a.repo / "docs" / "requirements.md").is_file():
        p.error("repo must be existing MyMiniHome checkout")
    if hashlib.sha256(a.zip.read_bytes()).hexdigest() != EXPECTED_SHA256:
        p.error("ZIP SHA-256 mismatch")
    with zipfile.ZipFile(a.zip) as z:
        names = z.namelist()
        if len(names) != EXPECTED_ENTRIES or z.testzip() is not None or len(set(names)) != len(names):
            p.error("archive member count, integrity, or duplicate paths invalid")
        for info in z.infolist():
            name = info.filename
            if (info.is_dir() or PurePosixPath(name).is_absolute()
                    or ".." in PurePosixPath(name).parts or "\\" in name
                    or (name != "manifest.json" and not name.startswith(ALLOWED_PREFIXES))):
                p.error("unsafe archive member: " + name)
            if ((info.external_attr >> 16) & 0o170000) == 0o120000:
                p.error("symlink member refused")
        manifest = json.loads(z.read("manifest.json"))
        frames = [f for meta in manifest["images"].values() for f in meta["frames"]]
        if (manifest.get("status") != "REVIEW_CANDIDATE_NOT_APPROVED"
                or len(manifest["images"]) != 9 or len(frames) != 54
                or not all(f in names for f in frames)):
            p.error("unexpected review manifest")
        target = a.repo / "assets" / "review" / "v0.2"
        existing = [name for name in names if (target / name).exists()]
        if existing:
            p.error(f"refusing to overwrite {len(existing)} files")
        print(f"{'APPLY' if a.apply else 'DRY-RUN'}: {len(names)} entries to {target}")
        if not a.apply:
            print("Use --apply to copy the REVIEW files.")
            return 0
        for info in z.infolist():
            dest = target / info.filename
            dest.parent.mkdir(parents=True, exist_ok=True)
            with z.open(info) as r, dest.open("wb") as w:
                while chunk := r.read(1024 * 1024):
                    w.write(chunk)
        mismatches = [name for name in names if hashlib.sha256((target / name).read_bytes()).digest()
                      != hashlib.sha256(z.read(name)).digest()]
        if mismatches:
            print("ERROR: post-copy hash mismatch", mismatches[:3], file=sys.stderr)
            return 2
        print("All exact bytes verified. REVIEW ONLY; no commit or deployment performed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
