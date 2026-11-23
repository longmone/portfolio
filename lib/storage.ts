import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Work } from "@/lib/works";

export type ProfileAssets = {
  photo: string;
  cv: string;
  cvName: string;
};

export type PortfolioContent = {
  works: Work[];
  profile: ProfileAssets;
};

export const defaultProfile: ProfileAssets = {
  photo: "",
  cv: "",
  cvName: "",
};

let browserClient: SupabaseClient | undefined;

function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase browser settings are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  browserClient ??= createClient(url, anonKey);
  return browserClient;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "The request could not be completed.");
  return data;
}

export function fetchPortfolioContent(): Promise<PortfolioContent> {
  return requestJson<PortfolioContent>("/api/portfolio", { cache: "no-store" });
}

export async function saveWorks(works: Work[]): Promise<void> {
  await requestJson("/api/admin/portfolio", {
    method: "PUT",
    body: JSON.stringify({ works }),
  });
  window.dispatchEvent(new Event("portfolio-content-updated"));
}

export async function saveProfile(profile: ProfileAssets): Promise<void> {
  await requestJson("/api/admin/portfolio", {
    method: "PATCH",
    body: JSON.stringify({ profile }),
  });
  window.dispatchEvent(new Event("portfolio-content-updated"));
}

export async function uploadMedia(file: File): Promise<string> {
  const { path, token, publicUrl } = await requestJson<{
    path: string;
    token: string;
    publicUrl: string;
  }>("/api/admin/media/sign", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });

  const { error } = await getBrowserClient()
    .storage.from("portfolio-media")
    .uploadToSignedUrl(path, token, file, { contentType: file.type });
  if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`);
  return publicUrl;
}
