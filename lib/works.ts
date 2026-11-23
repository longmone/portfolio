export type WorkCategory =
  | "Web Apps"
  | "Websites"
  | "Graphic Design"
  | "Video Editing";

export type Work = {
  id: string;
  title: string;
  category: WorkCategory;
  description: string;
  images: string[];
  projectUrl: string;
  githubUrl: string;
  tags: string[];
  featured: boolean;
};

export const initialWorks: Work[] = [
  {
    id: "work-atlas",
    title: "Atlas Finance",
    category: "Web Apps",
    description:
      "A confident, data-rich financial dashboard designed to make complex decisions feel simple.",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85",
    ],
    projectUrl: "",
    githubUrl: "",
    tags: ["Next.js", "TypeScript", "Fintech"],
    featured: true,
  },
  {
    id: "work-pulse",
    title: "Pulse Studio",
    category: "Web Apps",
    description:
      "A vibrant creator workspace connecting content planning, collaboration, and publishing.",
    images: [
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=85",
    ],
    projectUrl: "",
    githubUrl: "",
    tags: ["React", "Dashboard", "Product"],
    featured: true,
  },
  {
    id: "work-atelier",
    title: "Atelier No. 8",
    category: "Websites",
    description:
      "A refined editorial storefront for an independent fashion label with a point of view.",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85",
    ],
    projectUrl: "",
    githubUrl: "",
    tags: ["E-commerce", "Art Direction", "Responsive"],
    featured: true,
  },
  {
    id: "work-terrace",
    title: "The Terrace",
    category: "Websites",
    description:
      "A warm, immersive digital home for a neighborhood restaurant and its seasonal menu.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85",
    ],
    projectUrl: "",
    githubUrl: "",
    tags: ["Web Design", "Hospitality", "SEO"],
    featured: true,
  },
  {
    id: "work-form",
    title: "Form / Function",
    category: "Graphic Design",
    description:
      "A flexible visual identity system built for a modern architecture practice.",
    images: [
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=85",
    ],
    projectUrl: "",
    githubUrl: "",
    tags: ["Brand Identity", "Art Direction", "Print"],
    featured: true,
  },
  {
    id: "work-afterglow",
    title: "Afterglow",
    category: "Video Editing",
    description:
      "A cinematic campaign edit pairing tactile details with a quietly bold soundtrack.",
    images: [
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=85",
    ],
    projectUrl: "",
    githubUrl: "",
    tags: ["Video", "Color Grading", "Campaign"],
    featured: true,
  },
];

export const categories: WorkCategory[] = [
  "Web Apps",
  "Websites",
  "Graphic Design",
  "Video Editing",
];
