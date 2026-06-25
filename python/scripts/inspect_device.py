"""装置フォルダの xlsx 記入状況を表示する。"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from excel_normalize.device_paths import resolve_device_workbook
from excel_normalize.devices_root import DEVICES_DIR
from excel_normalize.inspect import format_inspect_report, inspect_workbook


def find_device_dir(internal_code: str) -> Path:
    matches = sorted(
        p
        for p in DEVICES_DIR.iterdir()
        if p.is_dir() and p.name.startswith(f"{internal_code}_")
    )
    if not matches:
        print(f"装置フォルダが見つかりません: {internal_code}_*", file=sys.stderr)
        raise SystemExit(1)
    if len(matches) > 1:
        names = ", ".join(p.name for p in matches)
        print(f"装置フォルダが複数あります: {names}", file=sys.stderr)
        raise SystemExit(1)
    return matches[0]


def resolve_device_dir(arg: str) -> Path:
    candidate = Path(arg)
    if candidate.is_dir():
        return candidate.resolve()
    under_devices = DEVICES_DIR / arg
    if under_devices.is_dir():
        return under_devices
    return find_device_dir(arg)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="装置 xlsx の記入状況サマリー（Excel取込.md §11）"
    )
    parser.add_argument(
        "device",
        help="社内番号（例: A0001）または data/devices 以下のフォルダ名",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="JSON 出力（エージェント向け）",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    device_dir = resolve_device_dir(args.device.strip())
    master_xlsx = resolve_device_workbook(device_dir)
    if not master_xlsx.is_file():
        print(
            f"xlsx が見つかりません: {master_xlsx}",
            file=sys.stderr,
        )
        return 1

    report = inspect_workbook(master_xlsx)
    if args.json:
        print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
    else:
        print(format_inspect_report(report))
    return 0 if report.normalize_ready else 1


if __name__ == "__main__":
    raise SystemExit(main())
