"""FlowchartStudio-ExcelConverter — verify · 版付き exe · Git タグ · GitHub Release。"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from converter_exe_util import EXE, EXE_BASENAME
from converter_exe_util import ROOT as PYTHON_ROOT

REPO_ROOT = Path(__file__).resolve().parents[2]
PYPROJECT = PYTHON_ROOT / "pyproject.toml"


def read_excel_normalize_version() -> str:
    text = PYPROJECT.read_text(encoding="utf-8")
    match = re.search(r'^version = "([^"]+)"', text, re.MULTILINE)
    if not match:
        raise SystemExit(f"version not found in {PYPROJECT}")
    return match.group(1)


def release_tag(version: str) -> str:
    return f"excel-converter-v{version}"


def release_asset_filename(version: str) -> str:
    return f"{EXE_BASENAME}-v{version}-win64.exe"


def default_release_notes(version: str) -> str:
    return f"""## Excel Converter v{version}

- Author xlsx → import.json（入力フォーマット v0.3）
- 詳細: [装置Excel変換exe.md](docs/03_技術仕様/装置Excel変換exe.md)

**対象:** Windows 10/11 64bit · Python 不要
"""


def tag_exists(tag: str) -> bool:
    result = subprocess.run(
        ["git", "rev-parse", tag],
        cwd=REPO_ROOT,
        capture_output=True,
        check=False,
    )
    return result.returncode == 0


def run_verify() -> int:
    script = PYTHON_ROOT / "scripts" / "build_and_verify_converter.py"
    return subprocess.run(
        [sys.executable, str(script)],
        cwd=REPO_ROOT,
        check=False,
    ).returncode


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Build verified exe and publish excel-converter GitHub Release"
    )
    parser.add_argument(
        "--skip-verify",
        action="store_true",
        help="Skip build_and_verify (dist exe must already exist)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned tag/asset only; no git/gh",
    )
    parser.add_argument(
        "--notes",
        default="",
        help="Release notes body (default: template from version)",
    )
    args = parser.parse_args(argv)

    version = read_excel_normalize_version()
    tag = release_tag(version)
    asset_name = release_asset_filename(version)
    asset_path = EXE.parent / asset_name

    if not args.skip_verify:
        if run_verify() != 0:
            print("excel:converter:verify failed", file=sys.stderr)
            return 1

    if not EXE.is_file():
        print(f"Missing built exe: {EXE}", file=sys.stderr)
        return 1

    shutil.copy2(EXE, asset_path)
    notes = args.notes or default_release_notes(version)

    print(f"version={version}")
    print(f"tag={tag}")
    print(f"asset={asset_path}")

    if args.dry_run:
        print("dry-run: no tag or GitHub Release created")
        return 0

    if tag_exists(tag):
        print(f"Git tag already exists: {tag}", file=sys.stderr)
        return 1

    subprocess.run(["git", "tag", tag], cwd=REPO_ROOT, check=True)
    subprocess.run(["git", "push", "origin", tag], cwd=REPO_ROOT, check=True)

    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", suffix=".md", delete=False
    ) as handle:
        handle.write(notes)
        notes_path = handle.name

    try:
        subprocess.run(
            [
                "gh",
                "release",
                "create",
                tag,
                str(asset_path),
                "--title",
                f"Excel Converter v{version}",
                "--notes-file",
                notes_path,
            ],
            cwd=REPO_ROOT,
            check=True,
        )
    finally:
        Path(notes_path).unlink(missing_ok=True)

    print(f"GitHub Release created: {tag}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
