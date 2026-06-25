"""作者装置データのルートパス（data/devices/ · SSOT）。"""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
DEVICES_DIR = REPO_ROOT / "data" / "devices"
