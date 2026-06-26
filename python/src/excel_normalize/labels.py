"""モジュール名などの表示用ラベル正規化。"""

from __future__ import annotations

import re

# Excel が U+001F をエスケープした痕跡（Q6）
_X001F_ESCAPE = re.compile(r"_x001F_", re.IGNORECASE)

# 未実装モジュールの予約枠（Q7b · モジュール ｺﾒﾝﾄ列の XXXX）
_PLACEHOLDER_XXXX = re.compile(r"_XXXX(?:_|$)|\*\*$")


def sanitize_module_label(label: str) -> str:
    """モジュール名から制御文字 U+001F とその Excel エスケープを除去する。"""
    cleaned = label.replace("\x1f", "")
    return _X001F_ESCAPE.sub("", cleaned)


def is_placeholder_module_label(label: str) -> bool:
    """構成上の予約枠（XXXX 等）— import.json / ナビには載せない（Q7b）。"""
    return bool(_PLACEHOLDER_XXXX.search(label))
