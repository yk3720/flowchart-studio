"""ビルド済み FlowchartStudio-ExcelConverter.exe の smoke テスト。"""

from __future__ import annotations

import json
import subprocess
import sys

from converter_exe_util import EXE, FIXTURE, SMOKE_OUT


def _run_module_cli() -> int:
    root = EXE.parents[1]
    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "excel_converter_gui",
            "--convert",
            str(FIXTURE),
            "-o",
            str(SMOKE_OUT),
            "-y",
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
        cwd=root.parent,
    )
    if proc.returncode != 0:
        print(proc.stdout)
        print(proc.stderr, file=sys.stderr)
        return proc.returncode
    return 0


def _run_frozen_exe() -> int:
    if not EXE.is_file():
        print(f"exe がありません: {EXE}", file=sys.stderr)
        return 1

    if SMOKE_OUT.is_file():
        SMOKE_OUT.unlink()

    proc = subprocess.run(
        [str(EXE), "--convert", str(FIXTURE), "-o", str(SMOKE_OUT), "-y"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
        timeout=120,
    )
    if proc.returncode != 0:
        print(proc.stdout)
        print(proc.stderr, file=sys.stderr)
        return proc.returncode
    return 0


def _assert_bundle() -> int:
    if not SMOKE_OUT.is_file():
        print("import.json が生成されませんでした", file=sys.stderr)
        return 1
    bundle = json.loads(SMOKE_OUT.read_text(encoding="utf-8"))
    if bundle.get("internal_code") != "Z00001":
        print(f"internal_code 不一致: {bundle.get('internal_code')}", file=sys.stderr)
        return 1
    SMOKE_OUT.unlink()
    return 0


def main() -> int:
    if not FIXTURE.is_file():
        print(f"fixture がありません: {FIXTURE}", file=sys.stderr)
        print("hint: npm run excel:fixture", file=sys.stderr)
        return 1

    if _run_module_cli() != 0:
        return 1
    if _assert_bundle() != 0:
        return 1

    if _run_frozen_exe() != 0:
        return 1
    if _assert_bundle() != 0:
        return 1

    size_mb = EXE.stat().st_size / (1024 * 1024)
    print(f"OK: module CLI + {EXE.name} ({size_mb:.1f} MB) / Z00001 fixture")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
