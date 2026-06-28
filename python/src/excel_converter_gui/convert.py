from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from excel_normalize.normalize import NormalizeError, normalize_workbook


@dataclass(frozen=True)
class ConvertSuccess:
    output_path: Path
    flow_count: int
    warnings: tuple[str, ...]


@dataclass(frozen=True)
class ConvertFailure:
    messages: tuple[str, ...]


def default_output_path(input_xlsx: Path) -> Path:
    return input_xlsx.parent / "import.json"


def convert_xlsx_to_import_json(
    input_xlsx: Path,
    output_path: Path,
) -> ConvertSuccess | ConvertFailure:
    if not input_xlsx.is_file():
        return ConvertFailure(
            (f"選択した Excel ファイルが見つかりません:\n{input_xlsx}",)
        )

    try:
        result = normalize_workbook(input_xlsx)
    except NormalizeError as exc:
        return ConvertFailure(tuple(exc.messages))
    except OSError as exc:
        return ConvertFailure(
            (
                "Excel ファイルを開けません。"
                "Excel で閉じてからもう一度お試しください。\n"
                f"（{exc}）",
            )
        )
    except ValueError as exc:
        return ConvertFailure((str(exc),))
    except Exception as exc:  # noqa: BLE001 — GUI 向け最終ラップ
        return ConvertFailure(
            (
                "予期しないエラーが発生しました。開発者に連絡してください。\n"
                f"（{type(exc).__name__}: {exc}）",
            )
        )

    text = json.dumps(result.bundle, ensure_ascii=False, indent=2) + "\n"
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(text, encoding="utf-8")
    except OSError as exc:
        return ConvertFailure(
            (
                "import.json を保存できません。"
                "フォルダの書き込み権限を確認してください:\n"
                f"{output_path}\n（{exc}）",
            )
        )

    return ConvertSuccess(
        output_path=output_path,
        flow_count=len(result.bundle.get("flows", [])),
        warnings=tuple(result.warnings),
    )
