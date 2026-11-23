import { NextRequest, NextResponse } from "next/server";
import { categories, type Work } from "@/lib/works";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ProfileAssets } from "@/lib/storage";

function isWork(value: unknown): value is Work {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<Work>;
  return typeof item.id === "string" && typeof item.title === "string" &&
    categories.includes(item.category as (typeof categories)[number]) &&
    typeof item.description === "string" &&
    Array.isArray(item.images) && item.images.every((image) => typeof image === "string") &&
    typeof item.projectUrl === "string" && typeof item.githubUrl === "string" &&
    Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === "string") &&
    typeof item.featured === "boolean";
}

function isProfile(value: unknown): value is ProfileAssets {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Partial<ProfileAssets>;
  return typeof profile.photo === "string" && typeof profile.cv === "string" &&
    typeof profile.cvName === "string";
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in to update portfolio content." }, { status: 401 });
  }

  let works: unknown;
  try {
    works = (await request.json()).works;
  } catch {
    return NextResponse.json({ error: "Provide valid portfolio data." }, { status: 400 });
  }
  if (!Array.isArray(works) || !works.every(isWork)) {
    return NextResponse.json({ error: "The project list has an invalid format." }, { status: 400 });
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from("portfolio_content")
      .update({ works, updated_at: new Date().toISOString() })
      .eq("id", "main");
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Could not save portfolio works to Supabase.", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save portfolio works." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in to update portfolio content." }, { status: 401 });
  }

  let profile: unknown;
  try {
    profile = (await request.json()).profile;
  } catch {
    return NextResponse.json({ error: "Provide valid profile data." }, { status: 400 });
  }
  if (!isProfile(profile)) {
    return NextResponse.json({ error: "The profile data has an invalid format." }, { status: 400 });
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from("portfolio_content")
      .update({ profile, updated_at: new Date().toISOString() })
      .eq("id", "main");
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Could not save profile assets to Supabase.", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save profile assets." },
      { status: 503 },
    );
  }
}
