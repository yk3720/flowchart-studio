"""FlowchartStudio-ExcelConverter.exe — ビルド · smoke 共通ユーティリティ。"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXE = ROOT / "dist" / "FlowchartStudio-ExcelConverter.exe"
SPEC = ROOT / "packaging" / "excel_converter.spec"
FIXTURE = ROOT / "testdata" / "fixtures" / "input-device-z00001.xlsx"
SMOKE_OUT = ROOT / "testdata" / "fixtures" / "_smoke-import-z00001.json"
EXE_BASENAME = "FlowchartStudio-ExcelConverter"


def kill_running_converter() -> None:
    """再ビルド前に dist exe のロックを解除（Windows）。"""
    if sys.platform != "win32":
        return
    subprocess.run(
        [
            "taskkill",
            "/IM",
            f"{EXE_BASENAME}.exe",
            "/F",
        ],
        capture_output=True,
        check=False,
    )


def run_pyinstaller() -> int:
    return subprocess.run(
        [sys.executable, "-m", "PyInstaller", str(SPEC), "--noconfirm"],
        cwd=ROOT,
        check=False,
    ).returncode
