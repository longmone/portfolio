-- Shared portfolio content and public media storage.
create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  works jsonb not null default '[]'::jsonb,
  profile jsonb not null default '{"photo":"","cv":"","cvName":""}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

insert into public.portfolio_content (id, works, profile)
values (
  'main',
  $$[
    {
      "id": "work-atlas",
      "title": "Atlas Finance",
      "category": "Web Apps",
      "description": "A confident, data-rich financial dashboard designed to make complex decisions feel simple.",
      "images": ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85"],
      "projectUrl": "",
      "githubUrl": "",
      "tags": ["Next.js", "TypeScript", "Fintech"],
      "featured": true
    },
    {
      "id": "work-pulse",
      "title": "Pulse Studio",
      "category": "Web Apps",
      "description": "A vibrant creator workspace connecting content planning, collaboration, and publishing.",
      "images": ["https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=85"],
      "projectUrl": "",
      "githubUrl": "",
      "tags": ["React", "Dashboard", "Product"],
      "featured": true
    },
    {
      "id": "work-atelier",
      "title": "Atelier No. 8",
      "category": "Websites",
      "description": "A refined editorial storefront for an independent fashion label with a point of view.",
      "images": ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85"],
      "projectUrl": "",
      "githubUrl": "",
      "tags": ["E-commerce", "Art Direction", "Responsive"],
      "featured": true
    },
    {
      "id": "work-terrace",
      "title": "The Terrace",
      "category": "Websites",
      "description": "A warm, immersive digital home for a neighborhood restaurant and its seasonal menu.",
      "images": ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85"],
      "projectUrl": "",
      "githubUrl": "",
      "tags": ["Web Design", "Hospitality", "SEO"],
      "featured": true
    },
    {
      "id": "work-form",
      "title": "Form / Function",
      "category": "Graphic Design",
      "description": "A flexible visual identity system built for a modern architecture practice.",
      "images": ["https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=85"],
      "projectUrl": "",
      "githubUrl": "",
      "tags": ["Brand Identity", "Art Direction", "Print"],
      "featured": true
    },
    {
      "id": "work-afterglow",
      "title": "Afterglow",
      "category": "Video Editing",
      "description": "A cinematic campaign edit pairing tactile details with a quietly bold soundtrack.",
      "images": ["https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=85"],
      "projectUrl": "",
      "githubUrl": "",
      "tags": ["Video", "Color Grading", "Campaign"],
      "featured": true
    }
  ]$$::jsonb,
  '{"photo":"","cv":"","cvName":""}'::jsonb
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800,
  array[
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
on storage.objects for select
to public
using (bucket_id = 'portfolio-media');
