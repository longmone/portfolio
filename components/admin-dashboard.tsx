"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Download,
  ImagePlus,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { defaultProfile, readProfile, readWorks, saveProfile, saveWorks, type ProfileAssets } from "@/lib/storage";
import { categories, initialWorks, type Work, type WorkCategory } from "@/lib/works";

const emptyWork = (): Work => ({
  id: `work-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: "",
  category: "Web Apps",
  description: "",
  images: [],
  projectUrl: "",
  githubUrl: "",
  tags: [],
  featured: false,
});

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error(`Could not read ${file.name}.`));
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [works, setWorks] = useState<Work[]>([]);
  const [editing, setEditing] = useState<Work | null>(null);
  const [profile, setProfile] = useState<ProfileAssets>(defaultProfile);
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/login")
      .then(async (response) => {
        if (response.ok) {
          setAuthenticated(true);
          setWorks(readWorks());
          setProfile(readProfile());
        }
      })
      .catch(() => setLoginError("Could not connect to the login service."))
      .finally(() => setChecking(false));
  }, []);

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Login failed.");
      setAuthenticated(true);
      setWorks(readWorks());
      setProfile(readProfile());
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      setAuthenticated(false);
      setEditing(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not log out.");
    }
  }

  function persistWorks(next: Work[]) {
    try {
      saveWorks(next);
      setWorks(next);
    } catch (error) {
      console.error("Could not save portfolio works.", error);
      notify("Could not save. Browser storage may be full; remove large images and try again.");
    }
  }

  async function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !editing) return;
    const oversized = files.find((file) => file.size > 1_200_000);
    if (oversized) {
      notify(`${oversized.name} is too large. Each image must be under 1.2 MB.`);
      return;
    }
    setBusy(true);
    try {
      const images = await Promise.all(files.map(readFile));
      setEditing({ ...editing, images: [...editing.images, ...images] });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not load the selected images.");
    } finally {
      setBusy(false);
    }
  }

  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_200_000) {
      notify("Profile photo must be under 1.2 MB.");
      return;
    }
    try {
      const next = { ...profile, photo: await readFile(file) };
      saveProfile(next);
      setProfile(next);
      notify("Profile photo saved.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not save the profile photo.");
    }
  }

  async function selectCv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_200_000) {
      notify("CV must be under 1.2 MB to fit browser storage.");
      return;
    }
    try {
      const next = { ...profile, cv: await readFile(file), cvName: file.name };
      saveProfile(next);
      setProfile(next);
      notify("CV saved.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not save the CV.");
    }
  }

  function saveWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const nextWork: Work = {
      ...editing,
      title: String(form.get("title") ?? "").trim(),
      category: String(form.get("category") ?? "Web Apps") as WorkCategory,
      description: String(form.get("description") ?? "").trim(),
      projectUrl: String(form.get("projectUrl") ?? "").trim(),
      githubUrl: String(form.get("githubUrl") ?? "").trim(),
      tags: String(form.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
      featured: form.get("featured") === "on",
    };
    const exists = works.some((work) => work.id === nextWork.id);
    persistWorks(exists ? works.map((work) => work.id === nextWork.id ? nextWork : work) : [nextWork, ...works]);
    setEditing(null);
    notify(exists ? "Work updated." : "Work added.");
  }

  function reorder(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= works.length) return;
    const next = [...works];
    [next[index], next[target]] = [next[target], next[index]];
    persistWorks(next);
  }

  function exportWorks() {
    const blob = new Blob([JSON.stringify(works, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mawuli-portfolio-works.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Works exported.");
  }

  async function importWorks(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || !parsed.every(isWork)) {
        throw new Error("This file is not a valid works backup.");
      }
      persistWorks(parsed);
      notify("Works imported.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not import that file.");
    }
  }

  function isWork(value: unknown): value is Work {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Partial<Work>;
    return typeof item.id === "string" && typeof item.title === "string" &&
      categories.includes(item.category as WorkCategory) && typeof item.description === "string" &&
      Array.isArray(item.images) && item.images.every((image) => typeof image === "string") &&
      typeof item.projectUrl === "string" && typeof item.githubUrl === "string" &&
      Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === "string") &&
      typeof item.featured === "boolean";
  }

  if (checking) {
    return <main className="admin-shell grid min-h-screen place-items-center text-sm text-white/55">Checking admin access…</main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-shell grid min-h-screen place-items-center px-4 py-10">
        <div className="glass w-full max-w-md rounded-[28px] p-7 sm:p-9">
          <a href="/" className="font-display text-xl font-bold tracking-[-0.08em]">MC<span className="text-violet">.</span></a>
          <p className="eyebrow mt-10">Private workspace</p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">Sign in to manage your portfolio and creative work.</p>
          <form onSubmit={login} className="mt-7">
            <label htmlFor="admin-password" className="text-xs text-white/65">Admin password</label>
            <input id="admin-password" type="password" autoComplete="current-password" className="input-glass mt-2" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {loginError && <p role="alert" className="mt-3 text-xs text-rose-300">{loginError}</p>}
            <button type="submit" disabled={busy} className="mt-5 w-full rounded-full bg-lime px-5 py-3 text-sm font-bold text-black transition hover:bg-lime/90 disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <a href="/" className="mt-6 inline-flex items-center gap-2 text-xs text-white/50 hover:text-white"><ArrowLeft size={14} /> Back to portfolio</a>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell min-h-screen px-4 py-6 sm:px-7 sm:py-9">
      <div className="mx-auto max-w-6xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/" className="font-display text-xl font-bold tracking-[-0.08em]">MC<span className="text-violet">.</span></a>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-violet">Portfolio workspace</p>
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">My Works Manager</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/" className="glass rounded-full px-4 py-2.5 text-xs font-semibold transition hover:bg-white/10">View site</a>
            <button onClick={logout} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:text-white"><LogOut size={14} /> Sign out</button>
          </div>
        </header>

        {message && <div role="status" className="fixed right-4 top-4 z-50 rounded-xl border border-lime/20 bg-[#141a10] px-4 py-3 text-sm text-lime shadow-xl">{message}</div>}

        <section className="mb-7 grid gap-3 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5"><p className="text-xs text-white/45">Saved projects</p><p className="font-display mt-2 text-3xl font-semibold">{works.length}</p></div>
          <div className="glass rounded-2xl p-5"><p className="text-xs text-white/45">Featured on homepage</p><p className="font-display mt-2 text-3xl font-semibold">{works.filter((work) => work.featured).length}</p></div>
          <div className="glass flex items-center justify-between rounded-2xl p-5"><div><p className="text-xs text-white/45">Your profile photo</p><p className="mt-2 text-sm font-medium">{profile.photo ? "Uploaded" : "Using default image"}</p></div><button onClick={() => photoInput.current?.click()} className="rounded-xl border border-white/10 p-2.5 text-white/70 hover:bg-white/10" aria-label="Upload profile photo"><ImagePlus size={18} /></button><input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={selectPhoto} /></div>
        </section>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button onClick={() => setEditing(emptyWork())} className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-black transition hover:bg-lime/90"><Plus size={16} /> Add new work</button>
          <button onClick={exportWorks} className="glass inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white/75 hover:bg-white/10"><Download size={15} /> Export JSON</button>
          <button onClick={() => importInput.current?.click()} className="glass inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white/75 hover:bg-white/10"><Upload size={15} /> Import JSON</button>
          <button onClick={() => { if (window.confirm("Restore the six original sample works? This replaces your current works.")) { persistWorks(initialWorks); notify("Sample works restored."); } }} className="glass inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white/50 hover:bg-white/10 hover:text-white"><ArrowDown size={14} /> Restore samples</button>
          <button onClick={() => cvInput.current?.click()} className="glass inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white/75 hover:bg-white/10"><Upload size={15} /> {profile.cvName ? "Replace CV" : "Upload CV"}</button>
          <input ref={importInput} type="file" accept="application/json,.json" className="hidden" onChange={importWorks} />
          <input ref={cvInput} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={selectCv} />
          {profile.cvName && <span className="text-xs text-white/45">CV: {profile.cvName}</span>}
        </div>

        {editing && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/75 px-3 py-5 backdrop-blur-sm sm:grid sm:place-items-center sm:p-6">
            <div className="glass my-auto w-full max-w-2xl rounded-[26px] p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between">
                <div><p className="eyebrow">Project details</p><h2 className="font-display mt-2 text-2xl font-semibold">{works.some((work) => work.id === editing.id) ? "Edit work" : "Add a new work"}</h2></div>
                <button onClick={() => setEditing(null)} aria-label="Close form" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><X size={19} /></button>
              </div>
              <form onSubmit={saveWork} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs text-white/65">Title<input name="title" className="input-glass mt-2" placeholder="Project name" defaultValue={editing.title} required /></label>
                  <label className="text-xs text-white/65">Category<select name="category" className="input-glass mt-2" defaultValue={editing.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                </div>
                <label className="block text-xs text-white/65">Description<textarea name="description" className="input-glass mt-2 min-h-24" placeholder="What makes this project special?" defaultValue={editing.description} required /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs text-white/65">Project URL<input name="projectUrl" type="url" className="input-glass mt-2" placeholder="https://example.com" defaultValue={editing.projectUrl} /></label>
                  <label className="text-xs text-white/65">GitHub URL<input name="githubUrl" type="url" className="input-glass mt-2" placeholder="https://github.com/…" defaultValue={editing.githubUrl} /></label>
                </div>
                <label className="block text-xs text-white/65">Tech tags <span className="text-white/35">(comma separated)</span><input name="tags" className="input-glass mt-2" placeholder="Next.js, TypeScript, Brand design" defaultValue={editing.tags.join(", ")} /></label>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-white/75"><input type="checkbox" name="featured" defaultChecked={editing.featured} className="h-4 w-4 accent-lime" /> Feature on the homepage carousel</label>

                <div>
                  <div className="mb-2 flex items-center justify-between"><p className="text-xs text-white/65">Project images</p><p className="text-[0.65rem] text-white/40">Up to 1.2 MB per image</p></div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {editing.images.map((image, index) => (
                      <div key={`${index}-${image.slice(0, 24)}`} className="relative aspect-[1.4] overflow-hidden rounded-xl border border-white/10">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${image}")` }} />
                        <button type="button" onClick={() => setEditing({ ...editing, images: editing.images.filter((_, current) => current !== index) })} aria-label={`Remove image ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-rose-500"><X size={13} /></button>
                      </div>
                    ))}
                    <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="flex aspect-[1.4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-xs text-white/50 transition hover:border-violet/60 hover:text-white disabled:opacity-50"><ImagePlus size={19} /> Add images</button>
                  </div>
                  <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={selectImages} />
                </div>
                <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
                  <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-3 text-xs font-semibold text-white/60 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-xs font-bold text-black disabled:opacity-50"><Save size={14} /> Save work</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="space-y-3">
          {works.map((work, index) => (
            <article key={work.id} className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-white/5 sm:w-36">
                {work.images[0] && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${work.images[0]}")` }} />}
                {!work.images[0] && <div className="grid h-full place-items-center text-white/25"><ImagePlus size={22} /></div>}
                {work.images.length > 1 && <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[0.6rem]">+{work.images.length - 1} images</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-semibold">{work.title || "Untitled work"}</h2>{work.featured && <span className="rounded-full border border-lime/20 bg-lime/10 px-2.5 py-1 text-[0.6rem] font-semibold text-lime">FEATURED</span>}</div>
                <p className="mt-1 text-xs text-violet">{work.category}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{work.description}</p>
                {work.tags.length > 0 && <p className="mt-2 truncate text-[0.65rem] text-white/35">{work.tags.join(" · ")}</p>}
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <button onClick={() => reorder(index, -1)} disabled={index === 0} aria-label={`Move ${work.title} up`} className="glass rounded-lg p-2 text-white/55 hover:text-white disabled:opacity-25"><ArrowUp size={15} /></button>
                <button onClick={() => reorder(index, 1)} disabled={index === works.length - 1} aria-label={`Move ${work.title} down`} className="glass rounded-lg p-2 text-white/55 hover:text-white disabled:opacity-25"><ArrowDown size={15} /></button>
                <button onClick={() => setEditing(work)} className="glass rounded-lg px-4 py-2 text-xs font-semibold text-white/75 hover:text-white">Edit</button>
                <button onClick={() => { if (window.confirm(`Delete “${work.title}”?`)) { persistWorks(works.filter((item) => item.id !== work.id)); notify("Work deleted."); } }} aria-label={`Delete ${work.title}`} className="glass rounded-lg p-2 text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-200"><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
          {!works.length && <div className="glass rounded-2xl p-12 text-center"><Check className="mx-auto text-lime" /><p className="mt-4 text-sm text-white/60">No projects yet. Add your first work to get started.</p></div>}
        </section>

        <p className="mt-8 text-center text-[0.68rem] leading-5 text-white/35">Your content is saved in this browser&apos;s local storage. Export a JSON backup regularly. Uploaded files are limited to 1.2 MB each.</p>
      </div>
    </main>
  );
}
