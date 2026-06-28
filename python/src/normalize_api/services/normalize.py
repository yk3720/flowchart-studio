from __future__ import annotations

import tempfile
from pathlib import Path

from excel_normalize.normalize import normalize_workbook
from excel_normalize.validate import NormalizeResult


def normalize_xlsx_file(path: Path) -> NormalizeResult:
    return normalize_workbook(path)


def normalize_xlsx_bytes(data: bytes) -> NormalizeResult:
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            tmp.write(data)
            temp_path = Path(tmp.name)
        return normalize_xlsx_file(temp_path)
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
