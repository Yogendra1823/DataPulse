import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInsight } from "@/lib/ai/client";
import type { InsightRequest } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: InsightRequest = await req.json();
    const { type, data, products, regions } = body;

    if (!type || !data?.length) {
      return NextResponse.json({ error: "type and data are required" }, { status: 400 });
    }

    const result = await generateInsight({ type, data, products, regions });

    // Optionally save to DB
    await supabase.from("ai_insights").insert({
      user_id:      user.id,
      insight_type: type,
      response:     result.content,
      model:        result.model,
      tokens_used:  result.tokensUsed,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("[/api/ai/insights]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
