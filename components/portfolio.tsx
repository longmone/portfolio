"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Download,
  Facebook,
  Film,
  Github,
  Globe2,
  Instagram,
  Linkedin,
  Menu,
  MousePointer2,
  Palette,
  Send,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { readProfile, readWorks } from "@/lib/storage";
import { categories, type Work } from "@/lib/works";

const navLinks = [
  ["Home", "#home"],
  ["Works", "#works"],
  ["Services", "#services"],
  ["About", "#about"],
  ["Contact", "#contact"],
];

const services = [
  {
    title: "Web App Development",
    icon: Code2,
    description: "Turn complex workflows into clear tools your team can use every day.",
    deliverables: ["Workflow tools", "Dashboards & platforms", "Frontend engineering"],
  },
  {
    title: "Website Development",
    icon: Globe2,
    description: "Make it easier for the right people to understand, trust, and choose you.",
    deliverables: ["Conversion-focused pages", "Business websites", "E-commerce experiences"],
  },
  {
    title: "Graphic Design",
    icon: Palette,
    description: "Give useful ideas a distinctive identity people recognize and remember.",
    deliverables: ["Brand identities", "Campaign systems", "Social media design"],
  },
  {
    title: "Video Editing",
    icon: Film,
    description: "Shape raw footage into focused stories that earn attention and move people.",
    deliverables: ["Social-first video", "Color grading", "Promotional films"],
  },
];

const skills = [
  ["HTML / CSS", 95],
  ["JavaScript / TypeScript", 90],
  ["React / Next.js", 88],
  ["Graphic Design", 92],
  ["Video Editing", 90],
] as const;

const testimonials = [
  {
    quote:
      "Mawuli brought clarity and care to every detail. The finished experience feels unmistakably like us, only better.",
    name: "Ama Ofori",
    role: "Founder, Form & Field",
  },
  {
    quote:
      "From the first sketch to launch day, the process was thoughtful, collaborative, and genuinely enjoyable.",
    name: "Kwame Mensah",
    role: "Creative Lead, Northstar",
  },
  {
    quote:
      "A rare combination of creative instinct and technical craft. We couldn't be happier with what we built together.",
    name: "Nana Asare",
    role: "Director, Studio Naya",
  },
];

const categoriesFilter = ["All", ...categories] as const;
const socialLinks: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "GitHub", icon: Github, href: "https://github.com/" },
  { label: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/" },
  { label: "Instagram", icon: Instagram, href: "https://www.instagram.com/" },
  { label: "Facebook", icon: Facebook, href: "https://www.facebook.com/" },
];

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  label,
  title,
  description,
  centered = false,
}: {
  label: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto mb-14 max-w-3xl text-center" : "mb-14 max-w-3xl"}>
      <p className="eyebrow mb-4">{label}</p>
      <h2 className="font-display section-heading">{title}</h2>
      {description && <p className="mt-5 max-w-2xl text-base leading-7 text-[#aaa9b5]">{description}</p>}
    </div>
  );
}

export default function Portfolio() {
  const [works, setWorks] = useState<Work[]>([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [cv, setCv] = useState("");
  const [cvName, setCvName] = useState("");
  const [filter, setFilter] = useState<(typeof categoriesFilter)[number]>("All");
  const [activeWork, setActiveWork] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const dragX = useMotionValue(0);

  useEffect(() => {
    const syncWorks = () => setWorks(readWorks());
    const syncProfile = () => {
      const profile = readProfile();
      setProfilePhoto(profile.photo);
      setCv(profile.cv);
      setCvName(profile.cvName);
    };
    syncWorks();
    syncProfile();
    window.addEventListener("portfolio-works-updated", syncWorks);
    window.addEventListener("portfolio-profile-updated", syncProfile);
    return () => {
      window.removeEventListener("portfolio-works-updated", syncWorks);
      window.removeEventListener("portfolio-profile-updated", syncProfile);
    };
  }, []);

  const featuredWorks = useMemo(
    () => works.filter((work) => work.featured && (filter === "All" || work.category === filter)),
    [works, filter],
  );
  const visibleWork = featuredWorks.length
    ? featuredWorks[((activeWork % featuredWorks.length) + featuredWorks.length) % featuredWorks.length]
    : undefined;

  useEffect(() => {
    setActiveWork(0);
  }, [filter]);

  useEffect(() => {
    if (featuredWorks.length < 2) return;
    const timer = window.setInterval(() => setActiveWork((current) => (current + 1) % featuredWorks.length), 6000);
    return () => window.clearInterval(timer);
  }, [featuredWorks.length, filter]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTestimonialIndex((current) => (current + 1) % testimonials.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const project = String(form.get("project") ?? "");
    const message = String(form.get("message") ?? "");
    const subject = encodeURIComponent(`${project || "Project inquiry"} from ${name}`);
    const body = encodeURIComponent(`Hi Mawuli,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:chrisamuzu12@gmail.com?subject=${subject}&body=${body}`;
    setFormStatus("Your email app is opening with your message.");
  }

  function moveWork(direction: number) {
    if (featuredWorks.length < 2) return;
    setActiveWork((current) => (current + direction + featuredWorks.length) % featuredWorks.length);
  }

  const photoStyle = profilePhoto
    ? { backgroundImage: `url("${profilePhoto}")` }
    : { backgroundImage: 'url("/images/mawuli-christoson.jpeg")' };

  return (
    <main className="portfolio-theme overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="blob absolute -right-36 -top-32 h-[440px] w-[440px] rounded-full bg-[#9b7bff]/20" />
        <div className="blob absolute -left-52 top-[38%] h-[380px] w-[380px] rounded-full bg-[#60e8ef]/10" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="glass mx-auto flex max-w-[1240px] items-center justify-between rounded-2xl px-5 py-3.5 md:px-7">
          <a href="#home" aria-label="Mawuli Christoson home" className="inline-flex items-center">
            <Image src="/images/mawuli-logo.png" alt="" width={80} height={80} priority className="h-12 w-12 object-contain" />
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="text-[0.86rem] text-[#c2c1ca] transition hover:text-white">
                {label}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="shine hidden items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-[#11130c] transition hover:-translate-y-0.5 md:inline-flex"
          >
            Start a project <ArrowUpRight size={16} />
          </a>
          <button
            className="rounded-xl border border-white/10 p-2 text-white md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden"
            >
              {navLinks.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5">
                  {label}
                </a>
              ))}
              <a href="#contact" onClick={() => setMenuOpen(false)} className="rounded-xl bg-lime px-4 py-3 text-center text-sm font-bold text-black">
                Start a project
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section id="home" className="relative flex min-h-[850px] items-center pb-20 pt-32 md:min-h-screen md:pt-28">
        <div className="container-wide grid items-center gap-14 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="relative z-10">
            <Reveal>
              <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-[#d3d1dc]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime shadow-[0_0_12px_#c5ff5c]" />
                Accra, Ghana <span className="text-white/25">/</span> Digital solutions for real-world needs
              </div>
              <p className="mb-5 text-lg text-[#c1bfca]">Mawuli Christoson <span className="text-violet">·</span> Digital maker</p>
              <h1 className="font-display max-w-[820px] text-[clamp(3.2rem,7.1vw,6.45rem)] font-semibold leading-[0.94] tracking-[-0.075em]">
                <span className="text-gradient">Real problems.</span>{" "}
                <span className="text-white">Useful digital solutions.</span>
              </h1>
              <p className="mt-7 max-w-[590px] text-base leading-7 text-[#a5a4b0] md:text-lg md:leading-8">
                I design and build websites, web apps, and visual identities that help businesses work smarter and connect with people.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#works" className="shine inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-bold text-[#11130c] transition hover:-translate-y-1">
                  Explore the work <ArrowDown size={16} />
                </a>
                <a href="#contact" className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-white/25">
                  Discuss a project <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="mt-12 grid max-w-[540px] grid-cols-3 gap-3 border-t border-white/10 pt-6">
                {[["Clearer", "customer journeys"], ["Faster", "everyday workflows"], ["Stronger", "brand presence"]].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">{value}</p>
                    <p className="mt-1 text-[0.7rem] text-[#8e8d99] sm:text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="relative mx-auto w-full max-w-[470px]">
            <div className="hero-orbit" aria-hidden="true" />
            <motion.div
              className="glass contrast-copy relative z-10 aspect-[0.88] rounded-[36px] p-3"
              animate={{ y: [0, -9, 0], rotate: [0, 0.3, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative h-full overflow-hidden rounded-[27px] bg-[#17151d]">
                <div className="absolute inset-0 bg-cover bg-center" style={photoStyle} role="img" aria-label="Portrait of Mawuli Christoson" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["Web Developer", "Graphic Designer", "Video Editor"].map((item) => (
                      <span key={item} className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[0.68rem] text-white/85 backdrop-blur-md">{item}</span>
                    ))}
                  </div>
                  <p className="font-display text-2xl font-semibold tracking-tight">Building with intention.</p>
                  <p className="mt-1 text-sm text-white/60">Web · Visuals · Stories</p>
                </div>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="glass absolute -left-7 top-[19%] flex items-center gap-3 rounded-2xl px-4 py-3 sm:-left-12">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/15 text-violet"><Code2 size={18} /></div>
              <div><p className="text-xs font-semibold">Digital craft</p><p className="mt-0.5 text-[0.65rem] text-white/50">Thoughtful by design</p></div>
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="glass absolute -right-3 top-[57%] flex items-center gap-2 rounded-full px-4 py-3 sm:-right-9">
              <Sparkles size={16} className="text-cyan" /><span className="text-xs font-medium">Made to be remembered</span>
            </motion.div>
            <div className="contrast-copy absolute -bottom-5 right-7 rounded-2xl border border-lime/25 bg-[#11170c]/85 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-medium text-lime"><span className="h-2 w-2 rounded-full bg-lime" /> Available for Work</div>
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/40 lg:flex">
          <MousePointer2 size={14} /> Scroll to explore
        </div>
      </section>

      <section aria-label="Services" className="border-y border-white/[0.07] bg-white/[0.018] py-5">
        <div className="marquee overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-7">
            {[0, 1].map((repeat) => (
              <div className="flex items-center gap-7" key={repeat} aria-hidden={repeat === 1}>
                {["Web Development", "Web Apps", "Graphic Design", "Video Editing", "Branding", "UI / UX"].map((text) => (
                  <span key={text} className="flex items-center gap-7 whitespace-nowrap font-display text-sm font-medium tracking-wide text-white/60 sm:text-base">
                    {text}<span className="h-1.5 w-1.5 rounded-full bg-violet/80" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="works" className="section-space">
        <div className="container-wide">
          <Reveal>
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <SectionTitle label="Selected work" title="Built around real needs." description="Digital products and visual systems designed to solve practical problems." />
              <div className="mb-14 flex max-w-full gap-2 overflow-x-auto pb-2 lg:justify-end">
                {categoriesFilter.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs transition ${filter === category ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {visibleWork ? (
              <motion.div
                key={visibleWork.id}
                className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.35 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                style={{ x: dragX }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) moveWork(1);
                  if (info.offset.x > 80) moveWork(-1);
                }}
              >
                <a href={visibleWork.projectUrl || undefined} target={visibleWork.projectUrl ? "_blank" : undefined} rel="noreferrer" className="work-card contrast-copy glass group relative block aspect-[1.38] cursor-grab overflow-hidden rounded-[28px] active:cursor-grabbing">
                  <div className="work-image absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${visibleWork.images[0] ?? ""}")` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5 transition group-hover:from-black/50" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[0.68rem] font-medium backdrop-blur-md">{visibleWork.category}</span>
                  <div className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/25 backdrop-blur-md transition group-hover:rotate-45 group-hover:bg-white group-hover:text-black"><ArrowUpRight size={19} /></div>
                  <div className="absolute bottom-6 left-6 flex items-end gap-3">
                    <span className="font-display text-5xl font-semibold tracking-[-0.08em] text-white/60">0{activeWork + 1}</span>
                    <span className="mb-1 text-xs uppercase tracking-[0.2em] text-white/65">Featured project</span>
                  </div>
                </a>
                <div className="px-1 lg:pl-5">
                  <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-violet"><span className="h-px w-8 bg-violet/70" />{visibleWork.category}</div>
                  <h3 className="font-display text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{visibleWork.title}</h3>
                  <p className="mt-5 max-w-lg text-base leading-7 text-[#a5a4b0]">{visibleWork.description}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {visibleWork.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/65">{tag}</span>)}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {visibleWork.projectUrl && <a href={visibleWork.projectUrl} target="_blank" rel="noreferrer" className="shine inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-black">Live project <ArrowUpRight size={16} /></a>}
                    {visibleWork.githubUrl && <a href={visibleWork.githubUrl} target="_blank" rel="noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"><Github size={16} /> Source code</a>}
                    {!visibleWork.projectUrl && !visibleWork.githubUrl && <span className="text-xs text-white/40">Project links coming soon</span>}
                  </div>
                  <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                    <div className="flex gap-2">
                      {featuredWorks.map((work, index) => <button key={work.id} onClick={() => setActiveWork(index)} aria-label={`Show project ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeWork === index ? "w-8 bg-violet" : "w-1.5 bg-white/25 hover:bg-white/50"}`} />)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => moveWork(-1)} aria-label="Previous project" className="glass grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10"><ArrowLeft size={17} /></button>
                      <button onClick={() => moveWork(1)} aria-label="Next project" className="glass grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10"><ArrowRight size={17} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-3xl p-12 text-center text-sm text-white/55">No featured projects in this category yet.</div>
            )}
          </AnimatePresence>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {works.filter((work) => !work.featured || filter === "All" || work.category === filter).map((work) => (
              <div key={work.id} className="glass work-card group overflow-hidden rounded-2xl">
                <div className="contrast-copy relative aspect-[1.7] overflow-hidden bg-white/5">
                  <div className="work-image absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${work.images[0] ?? ""}")` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[0.65rem] backdrop-blur-md">{work.category}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">{work.title}</h3>
                    {work.projectUrl && <a href={work.projectUrl} target="_blank" rel="noreferrer" aria-label={`Visit ${work.title}`} className="text-white/50 hover:text-white"><ArrowUpRight size={17} /></a>}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">{work.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="section-space border-y border-white/[0.06] bg-white/[0.018]">
        <div className="container-wide">
          <Reveal><SectionTitle label="Problems I solve" title="From friction to forward motion." description="Digital products and creative systems built to make everyday work simpler, clearer, and more effective." /></Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(({ title, icon: Icon, description, deliverables }, index) => (
              <Reveal key={title} delay={index * 0.06}>
                <motion.article whileHover={{ y: -5 }} className="glass shine h-full rounded-[24px] p-6 sm:p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-violet/20 bg-violet/10 text-violet"><Icon size={22} strokeWidth={1.7} /></div>
                    <span className="font-display text-sm text-white/35">0{index + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/55">{description}</p>
                  <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
                    {deliverables.map((item) => <li key={item} className="flex items-center gap-2.5 text-sm text-white/70"><Check size={15} className="text-lime" />{item}</li>)}
                  </ul>
                  <a href="#contact" className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-white/65 transition hover:text-lime">See how it can work for you <ArrowUpRight size={14} /></a>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="section-space">
        <div className="container-wide grid gap-14 lg:grid-cols-[0.83fr_1.17fr] lg:items-center">
          <Reveal className="relative">
            <div className="glass rounded-[30px] p-3">
              <div className="contrast-copy relative aspect-[0.9] overflow-hidden rounded-[22px] bg-[#16131c]">
                <div className="absolute inset-0 bg-cover bg-center" style={photoStyle} role="img" aria-label="Mawuli Christoson portrait" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="font-display text-2xl font-semibold">Curious by nature.</p>
                  <p className="mt-1 text-sm text-white/60">Creative by practice.</p>
                </div>
              </div>
            </div>
            <div className="glass absolute -bottom-6 -right-4 rounded-2xl px-5 py-4 sm:-right-7">
              <p className="font-display text-2xl font-semibold text-gradient">Accra, GH</p>
              <p className="mt-1 text-xs text-white/50">Working everywhere</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">How I work</p>
            <h2 className="font-display text-[clamp(2.6rem,5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.065em]">Clear thinking.<br /><span className="text-gradient">Useful outcomes.</span></h2>
            <p className="mt-6 text-base leading-7 text-[#aaa9b5]">I&apos;m Mawuli, a developer and creative based in Accra, Ghana. I bring product thinking, design, and engineering together to solve practical problems.</p>
            <p className="mt-4 text-base leading-7 text-[#aaa9b5]">The goal is work that looks distinct, feels effortless, and holds up in the real world.</p>
            <div className="mt-9 space-y-5">
              {skills.map(([label, percentage], index) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-xs"><span className="text-white/75">{label}</span><span className="text-white/45">{percentage}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-violet to-cyan" initial={{ width: 0 }} whileInView={{ width: `${percentage}%` }} viewport={{ once: true }} transition={{ duration: 1.1, delay: index * 0.1 }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contact" className="shine inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-black">Build a solution <ArrowUpRight size={15} /></a>
              {cv ? (
                <a href={cv} download={cvName || "Mawuli-Christoson-CV"} className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                  <Download size={15} /> Download my CV
                </a>
              ) : (
                <a href="#contact" className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
                  <Download size={15} /> Request credentials
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space border-y border-white/[0.06] bg-white/[0.018]">
        <div className="container-wide">
          <Reveal><SectionTitle label="Built around the challenge" title="A practical route to a better result." centered /></Reveal>
          <div className="relative grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-violet/10 via-violet/50 to-cyan/10 lg:block" />
            {[
              ["01", "Understand", "Define the real problem and what a better outcome means."],
              ["02", "Shape", "Set a clear direction around the people who will use it."],
              ["03", "Build", "Develop, test, and refine a solution that works in practice."],
              ["04", "Improve", "Launch with confidence and keep learning from real use."],
            ].map(([number, title, description], index) => (
              <Reveal key={number} delay={index * 0.08}>
                <div className="relative">
                  <div className="glass mb-5 grid h-16 w-16 place-items-center rounded-2xl font-display text-sm font-semibold text-cyan">{number}</div>
                  <h3 className="font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide">
          <Reveal>
            <div className="glass relative mx-auto max-w-4xl overflow-hidden rounded-[30px] px-7 py-12 text-center sm:px-14 sm:py-16">
              <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet/15 blur-[80px]" />
              <p className="eyebrow mb-5">What good collaboration feels like</p>
              <AnimatePresence mode="wait">
                <motion.div key={testimonialIndex} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                  <p className="font-display mx-auto max-w-3xl text-2xl font-medium leading-snug tracking-[-0.035em] sm:text-3xl">“{testimonials[testimonialIndex].quote}”</p>
                  <p className="mt-8 text-sm font-semibold">{testimonials[testimonialIndex].name}</p>
                  <p className="mt-1 text-xs text-white/45">{testimonials[testimonialIndex].role}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-7 flex justify-center gap-2">
                {testimonials.map((item, index) => <button key={item.name} onClick={() => setTestimonialIndex(index)} aria-label={`Read testimonial ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === testimonialIndex ? "w-7 bg-violet" : "w-1.5 bg-white/25"}`} />)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contact" className="section-space border-t border-white/[0.06] bg-white/[0.018]">
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="eyebrow mb-4">Bring me the challenge</p>
              <h2 className="font-display text-[clamp(3rem,6.4vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.07em]">Let&apos;s solve<br /><span className="text-gradient">what&apos;s next.</span></h2>
              <p className="mt-6 max-w-md text-base leading-7 text-[#a5a4b0]">Share the challenge or opportunity. I&apos;ll map a clear route to a practical solution.</p>
              <div className="mt-9 space-y-4">
                <a href="mailto:chrisamuzu12@gmail.com" className="flex items-center gap-3 text-sm text-white/75 transition hover:text-lime"><Send size={16} className="text-violet" /> chrisamuzu12@gmail.com</a>
                <a href="tel:+233245215539" className="flex items-center gap-3 text-sm text-white/75 transition hover:text-lime"><Globe2 size={16} className="text-violet" /> +233 24 521 5539 / +233 50 883 7195</a>
                <a href="https://wa.me/233245215539" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/5 px-4 py-2.5 text-xs font-semibold text-lime transition hover:bg-lime/10">Message me on WhatsApp <ArrowUpRight size={14} /></a>
              </div>
              <div className="mt-8 flex gap-2">
                {socialLinks.map(({ label, icon: Icon, href }) => (
                  <a key={label} aria-label={label} href={href} target="_blank" rel="noreferrer" className="glass grid h-10 w-10 place-items-center rounded-full text-white/65 transition hover:-translate-y-1 hover:text-white"><Icon size={16} /></a>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <form onSubmit={submitContact} className="glass rounded-[26px] p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs text-white/65">Your name<input className="input-glass mt-2" name="name" placeholder="Jane Smith" required /></label>
                  <label className="text-xs text-white/65">Email address<input className="input-glass mt-2" name="email" type="email" placeholder="jane@company.com" required /></label>
                </div>
                <label className="mt-5 block text-xs text-white/65">What do you have in mind?<select className="input-glass mt-2" name="project" defaultValue=""><option value="" disabled>Select a project type</option>{services.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}<option value="Something else">Something else</option></select></label>
                <label className="mt-5 block text-xs text-white/65">A little about your project<textarea className="input-glass mt-2 min-h-[140px] resize-y" name="message" placeholder="The big idea, the timeline, or just where you're stuck..." required /></label>
                <button type="submit" className="shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 sm:w-auto">Send an inquiry <ArrowUpRight size={16} /></button>
                {formStatus && <p role="status" className="mt-4 text-xs text-lime">{formStatus}</p>}
                <p className="mt-4 text-[0.68rem] text-white/40">This form opens your email app — no data is stored or sent to a server.</p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] py-7">
        <div className="container-wide flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <a href="#home" aria-label="Mawuli Christoson home" className="inline-flex items-center">
            <Image src="/images/mawuli-logo.png" alt="" width={64} height={64} className="h-9 w-9 object-contain" />
          </a>
          <p className="text-xs text-white/40">© 2026 Mawuli Christoson. Made with intention in Accra.</p>
          <a href="#home" className="inline-flex items-center gap-2 text-xs text-white/55 transition hover:text-white"><ArrowUpRight size={14} className="-rotate-45" /> Back to top</a>
        </div>
      </footer>
    </main>
  );
}
