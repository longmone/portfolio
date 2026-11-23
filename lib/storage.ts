import { initialWorks, type Work } from "@/lib/works";

export const WORKS_STORAGE_KEY = "mawuli-portfolio-works-v1";
export const PROFILE_STORAGE_KEY = "mawuli-portfolio-profile-v1";

export type ProfileAssets = {
  photo: string;
  cv: string;
  cvName: string;
};

export const defaultProfile: ProfileAssets = {
  photo: "",
  cv: "",
  cvName: "",
};

export function readWorks(): Work[] {
  if (typeof window === "undefined") return initialWorks;
  const saved = window.localStorage.getItem(WORKS_STORAGE_KEY);
  if (!saved) return initialWorks;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved works must be a JSON array.");
    return parsed as Work[];
  } catch (error) {
    console.error("Could not read saved portfolio works.", error);
    return initialWorks;
  }
}

export function saveWorks(works: Work[]): void {
  window.localStorage.setItem(WORKS_STORAGE_KEY, JSON.stringify(works));
  window.dispatchEvent(new Event("portfolio-works-updated"));
}

export function readProfile(): ProfileAssets {
  if (typeof window === "undefined") return defaultProfile;
  const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!saved) return defaultProfile;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("photo" in parsed) ||
      !("cv" in parsed) ||
      !("cvName" in parsed)
    ) {
      throw new Error("Saved profile assets have an invalid format.");
    }
    return parsed as ProfileAssets;
  } catch (error) {
    console.error("Could not read saved profile assets.", error);
    return defaultProfile;
  }
}

export function saveProfile(profile: ProfileAssets): void {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("portfolio-profile-updated"));
}
