"""converter exe をビルドし smoke まで一括実行（再ビルド前に exe プロセス停止）。"""

from __future__ import annotations

import sys

from converter_exe_util import kill_running_converter, run_pyinstaller
from smoke_converter_exe import main as smoke_main


def main() -> int:
    kill_running_converter()
    if run_pyinstaller() != 0:
        print("PyInstaller build failed", file=sys.stderr)
        return 1
    return smoke_main()


if __name__ == "__main__":
    raise SystemExit(main())
