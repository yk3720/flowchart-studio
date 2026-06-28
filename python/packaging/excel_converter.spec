# -*- mode: python ; coding: utf-8 -*-
# Flowchart Studio — Excel 変換 exe（PyInstaller）
# 実行: cd python && pyinstaller packaging/excel_converter.spec --noconfirm

from pathlib import Path

block_cipher = None
root = Path(SPECPATH).parent
src = root / "src"

a = Analysis(
    [str(root / "packaging" / "excel_converter_entry.py")],
    pathex=[str(src)],
    binaries=[],
    datas=[],
    hiddenimports=[
        "openpyxl",
        "excel_normalize",
        "excel_converter_gui",
        "excel_converter_gui.runner",
        "excel_converter_gui.app",
        "excel_converter_gui.cli",
        "excel_converter_gui.convert",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="FlowchartStudio-ExcelConverter",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    version=str(root / "packaging" / "version_info.txt"),
)
