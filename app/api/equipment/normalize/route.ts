import { NextResponse } from "next/server";

import { requireEditor } from "@/lib/flowchart/actions/documents/flowDocumentsAuth";
import { proxyEquipmentNormalize } from "@/backend/src/lib/flowchart/normalize/equipmentNormalizeProxy";

export async function POST(request: Request) {
  try {
    await requireEditor();
  } catch {
    return NextResponse.json({ error: "編集権限が必要です" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "multipart 形式でファイルを送信してください" },
      { status: 400 }
    );
  }

  const entry = formData.get("file");
  if (!(entry instanceof File)) {
    return NextResponse.json(
      { error: "file フィールドに .xlsx を指定してください" },
      { status: 400 }
    );
  }

  const result = await proxyEquipmentNormalize(entry);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.errors ? { errors: result.errors } : {}),
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    bundle: result.bundle,
    warnings: result.warnings,
  });
}
