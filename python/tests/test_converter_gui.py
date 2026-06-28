from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from excel_converter_gui.convert import (
    ConvertFailure,
    ConvertSuccess,
    convert_xlsx_to_import_json,
    default_output_path,
)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "testdata" / "fixtures"
INPUT_XLSX = FIXTURES / "input-device-z00001.xlsx"


@pytest.fixture(scope="session")
def input_xlsx() -> Path:
    if not INPUT_XLSX.is_file():
        pytest.skip("fixture 未生成 — scripts/build_fixture.py を実行してください")
    return INPUT_XLSX


def test_default_output_path() -> None:
    assert default_output_path(Path("C:/work/Z00001.xlsx")) == Path(
        "C:/work/import.json"
    )


def test_convert_success(input_xlsx: Path, tmp_path: Path) -> None:
    out = tmp_path / "import.json"
    result = convert_xlsx_to_import_json(input_xlsx, out)
    assert isinstance(result, ConvertSuccess)
    assert result.flow_count >= 1
    assert out.is_file()
    bundle = json.loads(out.read_text(encoding="utf-8"))
    assert bundle["internal_code"] == "Z00001"


def test_convert_missing_input(tmp_path: Path) -> None:
    result = convert_xlsx_to_import_json(
        tmp_path / "missing.xlsx", tmp_path / "import.json"
    )
    assert isinstance(result, ConvertFailure)
    assert result.messages


def test_convert_readonly_output_dir(input_xlsx: Path, tmp_path: Path) -> None:
    if sys.platform == "win32":
        pytest.skip("Windows ではディレクトリ chmod による書込拒否テスト不可")
    blocked = tmp_path / "blocked"
    blocked.mkdir()
    out = blocked / "import.json"
    blocked.chmod(0o444)
    try:
        result = convert_xlsx_to_import_json(input_xlsx, out)
    finally:
        blocked.chmod(0o755)
    assert isinstance(result, ConvertFailure)
    assert "保存できません" in result.messages[0]
