from __future__ import annotations

import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from . import APP_SUBTITLE, APP_TITLE, VERSION
from .convert import (
    ConvertFailure,
    ConvertSuccess,
    convert_xlsx_to_import_json,
    default_output_path,
)


class ConverterApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title(APP_TITLE)
        self.root.minsize(520, 360)
        self._busy = False
        self._build_ui()

    def _build_ui(self) -> None:
        frame = ttk.Frame(self.root, padding=16)
        frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(frame, text=APP_TITLE, font=("Segoe UI", 14, "bold")).pack(
            anchor=tk.W
        )
        ttk.Label(frame, text=APP_SUBTITLE).pack(anchor=tk.W, pady=(4, 12))
        ttk.Label(
            frame,
            text="Excel で編集した装置 xlsx を選ぶと、同じフォルダに import.json を出力します。",
            wraplength=480,
        ).pack(anchor=tk.W, pady=(0, 12))

        self.select_button = ttk.Button(
            frame,
            text="Excel ファイルを選ぶ…",
            command=self._on_select,
        )
        self.select_button.pack(anchor=tk.W)

        self.status = tk.Text(frame, height=12, wrap=tk.WORD, state=tk.DISABLED)
        self.status.pack(fill=tk.BOTH, expand=True, pady=(12, 0))

        ttk.Label(frame, text=f"v{VERSION}", foreground="#666666").pack(
            anchor=tk.E, pady=(8, 0)
        )

    def _set_status(self, text: str) -> None:
        self.status.configure(state=tk.NORMAL)
        self.status.delete("1.0", tk.END)
        self.status.insert(tk.END, text)
        self.status.configure(state=tk.DISABLED)

    def _set_busy(self, busy: bool) -> None:
        self._busy = busy
        state = tk.DISABLED if busy else tk.NORMAL
        self.select_button.configure(state=state)
        if busy:
            self.root.configure(cursor="watch")
        else:
            self.root.configure(cursor="")

    def _on_select(self) -> None:
        if self._busy:
            return
        path = filedialog.askopenfilename(
            title="入力用 Excel を選択",
            filetypes=[
                ("Excel ファイル", "*.xlsx *.xls"),
                ("すべて", "*.*"),
            ],
        )
        if not path:
            return

        input_xlsx = Path(path)
        output_path = default_output_path(input_xlsx)
        if output_path.is_file() and not messagebox.askyesno(
            APP_TITLE,
            f"import.json は既にあります。\n上書きしますか？\n\n出力先:\n{output_path}",
        ):
            self._set_status("キャンセルしました。")
            return

        self._set_busy(True)
        self._set_status("変換中…")

        def run() -> None:
            result = convert_xlsx_to_import_json(input_xlsx, output_path)
            self.root.after(0, lambda: self._on_convert_done(result))

        threading.Thread(target=run, daemon=True).start()

    def _on_convert_done(self, result: ConvertSuccess | ConvertFailure) -> None:
        self._set_busy(False)
        if isinstance(result, ConvertFailure):
            self._set_status("\n\n".join(result.messages))
            messagebox.showerror(
                APP_TITLE, "変換できませんでした。\n詳細は画面内を確認してください。"
            )
            return

        lines = [
            "変換が完了しました。",
            f"出力: {result.output_path}",
            f"フロー数: {result.flow_count}",
        ]
        if result.warnings:
            lines.append("")
            lines.append("警告:")
            lines.extend(f"・{warning}" for warning in result.warnings)
        self._set_status("\n".join(lines))
        messagebox.showinfo(
            APP_TITLE,
            f"import.json を出力しました。\n\n{result.output_path}\n（{result.flow_count} フロー）",
        )


def main() -> int:
    root = tk.Tk()
    ConverterApp(root)
    root.mainloop()
    return 0
