import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 同一オリジン相対パスのみ許可（プロトコル相対 `//` を防ぐ） */
function safeRedirectPath(next: string | null): string {
  if (!next) return "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** signInWithOtp の token_hash は公式どおり `email`（magiclink は非推奨） */
function normalizeEmailOtpType(type: string | null): EmailOtpType | null {
  if (!type) return null;
  if (type === "magiclink" || type === "signup") return "email";
  return type as EmailOtpType;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeRedirectPath(searchParams.get("next"));
  const fail = () => NextResponse.redirect(`${origin}/login?error=auth`);

  const supabase = await createSupabaseServerClient();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return fail();
  }

  const tokenHash = searchParams.get("token_hash");
  const type = normalizeEmailOtpType(searchParams.get("type"));
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return fail();
}
