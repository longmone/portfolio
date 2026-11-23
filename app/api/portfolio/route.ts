import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { PortfolioContent } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("works, profile")
      .eq("id", "main")
      .single();

    if (error) throw error;
    return NextResponse.json(data satisfies PortfolioContent);
  } catch (error) {
    console.error("Could not load portfolio content from Supabase.", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load portfolio content." },
      { status: 503 },
    );
  }
}
