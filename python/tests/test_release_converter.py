from __future__ import annotations

import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from release_converter import (  # noqa: E402
    default_release_notes,
    read_excel_normalize_version,
    release_asset_filename,
    release_tag,
)


def test_read_excel_normalize_version_matches_pyproject():
    version = read_excel_normalize_version()
    text = (Path(__file__).resolve().parents[1] / "pyproject.toml").read_text(
        encoding="utf-8"
    )
    assert f'version = "{version}"' in text


def test_release_tag_and_asset():
    assert release_tag("0.1.1") == "excel-converter-v0.1.1"
    assert (
        release_asset_filename("0.1.1")
        == "FlowchartStudio-ExcelConverter-v0.1.1-win64.exe"
    )


def test_default_release_notes_contains_version():
    notes = default_release_notes("0.1.1")
    assert "0.1.1" in notes
    assert "装置Excel変換exe.md" in notes
