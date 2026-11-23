import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const allowedTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{1,8}$/.test(extension) ? extension : "bin";
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in before uploading media." }, { status: 401 });
  }

  let fileName: unknown;
  let contentType: unknown;
  try {
    ({ fileName, contentType } = await request.json());
  } catch {
    return NextResponse.json({ error: "Provide a valid file name and type." }, { status: 400 });
  }
  if (
    typeof fileName !== "string" ||
    typeof contentType !== "string" ||
    !allowedTypes.has(contentType)
  ) {
    return NextResponse.json({ error: "This file type is not supported." }, { status: 400 });
  }

  try {
    const path = `${randomUUID()}.${safeExtension(fileName)}`;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("portfolio-media")
      .createSignedUploadUrl(path);
    if (error) throw error;
    const { data: publicData } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    return NextResponse.json({ path, token: data.token, publicUrl: publicData.publicUrl });
  } catch (error) {
    console.error("Could not create a signed portfolio media upload.", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not prepare the media upload." },
      { status: 503 },
    );
  }
}
