from __future__ import annotations

import json
from pathlib import Path

import pytest

from excel_normalize.inspect import format_inspect_report, inspect_workbook
from excel_normalize.normalize import normalize_workbook

ROOT = Path(__file__).resolve().parents[1]
INPUT_XLSX = ROOT / "testdata" / "fixtures" / "input-device-z00001.xlsx"


@pytest.fixture(scope="session")
def input_xlsx() -> Path:
    if not INPUT_XLSX.is_file():
        pytest.skip("fixture 未生成 — scripts/build_fixture.py を実行してください")
    return INPUT_XLSX


def test_inspect_full_fixture(input_xlsx: Path) -> None:
    report = inspect_workbook(input_xlsx)
    assert report.internal_code == "Z00001"
    assert report.normalize_ready is True
    assert len(report.flows_present) == 4
    assert report.flows_missing == []
    text = format_inspect_report(report)
    assert "Z00001" in text
    assert "normalize: ✓" in text


def test_inspect_json_output(input_xlsx: Path) -> None:
    report = inspect_workbook(input_xlsx)
    data = report.to_dict()
    assert data["flow_present_count"] == 4
    assert json.dumps(data, ensure_ascii=False)


def test_partial_unit_sheets_skipped(tmp_path: Path) -> None:
    from excel_normalize.a0001_v03 import build_a0001_v03_workbook

    path = tmp_path / "partial-u0-only.xlsx"
    wb = build_a0001_v03_workbook()
    for sheet_name in [f"U{i}" for i in range(1, 10)]:
        del wb[sheet_name]
    wb.save(path)

    report = inspect_workbook(path)
    assert report.normalize_ready is True
    assert report.unit_sheets_present == ["U0"]
    assert len(report.unit_sheets_missing) == 9
    assert len(report.flows_present) == 10

    result = normalize_workbook(path)
    assert len(result.bundle["units"]) == 10
    assert len(result.bundle["flows"]) == 10
    assert len(result.warnings) >= 90
