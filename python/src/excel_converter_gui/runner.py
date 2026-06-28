from __future__ import annotations

import sys

from excel_converter_gui.app import main as gui_main
from excel_converter_gui.cli import run_cli


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] == "--convert":
        return run_cli(sys.argv[2:])
    return gui_main()
