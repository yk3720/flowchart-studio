from excel_normalize.labels import is_placeholder_module_label, sanitize_module_label


def test_sanitize_module_label_removes_x001f_escape() -> None:
    raw = "M000供給ﾏｶﾞｼﾞﾝ_ﾏｶﾞｼﾞﾝｾｯﾄ位置_x001F_"
    assert sanitize_module_label(raw) == "M000供給ﾏｶﾞｼﾞﾝ_ﾏｶﾞｼﾞﾝｾｯﾄ位置"


def test_sanitize_module_label_removes_control_char() -> None:
    raw = "M001供給\x1fﾏｶﾞｼﾞﾝ"
    assert sanitize_module_label(raw) == "M001供給ﾏｶﾞｼﾞﾝ"


def test_is_placeholder_module_label_detects_xxxx() -> None:
    assert is_placeholder_module_label("M008供給_XXXX")
    assert is_placeholder_module_label("M046塗布1_XXXX")
    assert not is_placeholder_module_label("M002供給SUS板_取")
