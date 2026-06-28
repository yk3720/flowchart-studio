from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .convert import ConvertFailure, convert_xlsx_to_import_json, default_output_path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="入力用 Excel → import.json（GUI 省略 · ビルド smoke 用）"
    )
    parser.add_argument("input", type=Path, help="入力用 .xlsx")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="出力 import.json（省略時は xlsx と同じフォルダ）",
    )
    parser.add_argument(
        "-y",
        "--yes",
        action="store_true",
        help="既存 import.json を確認なしで上書き",
    )
    return parser


def run_cli(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if not args.input.is_file():
        print(f"ファイルがありません: {args.input}", file=sys.stderr)
        return 1

    output_path = args.output or default_output_path(args.input)
    if output_path.is_file() and not args.yes:
        print(
            f"import.json は既にあります: {output_path}\n"
            "上書きする場合は -y を付けてください。",
            file=sys.stderr,
        )
        return 2

    result = convert_xlsx_to_import_json(args.input, output_path)
    if isinstance(result, ConvertFailure):
        for msg in result.messages:
            print(msg, file=sys.stderr)
        return 1

    print(f"Wrote {result.output_path} ({result.flow_count} flows)")
    for warning in result.warnings:
        print(f"警告: {warning}", file=sys.stderr)
    return 0
