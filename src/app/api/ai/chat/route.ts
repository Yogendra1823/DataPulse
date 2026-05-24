import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatWithData } from "@/lib/ai/client";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      question,
      history,
      dataContext,
    }: {
      question:    string;
      history:     ChatMessage[];
      dataContext: string;
    } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const content = await chatWithData(question, history ?? [], dataContext ?? "");
    return NextResponse.json({ content });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("[/api/ai/chat]", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
