from __future__ import annotations

from pathlib import Path

import pytest

from excel_converter_gui.cli import run_cli

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "testdata" / "fixtures"
INPUT_XLSX = FIXTURES / "input-device-z00001.xlsx"


@pytest.fixture(scope="session")
def input_xlsx() -> Path:
    if not INPUT_XLSX.is_file():
        pytest.skip("fixture 未生成")
    return INPUT_XLSX


def test_cli_convert(input_xlsx: Path, tmp_path: Path) -> None:
    out = tmp_path / "import.json"
    assert run_cli([str(input_xlsx), "-o", str(out), "-y"]) == 0
    assert out.is_file()


def test_cli_refuses_overwrite(input_xlsx: Path, tmp_path: Path) -> None:
    out = tmp_path / "import.json"
    out.write_text("{}", encoding="utf-8")
    assert run_cli([str(input_xlsx), "-o", str(out)]) == 2
