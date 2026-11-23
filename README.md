# Mawuli Christoson — Portfolio

A vibrant, responsive portfolio built with Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.

## Run locally

1. Install Node.js 20.9+.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and configure the admin password and Supabase keys as described below.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Connect Supabase

The portfolio stores projects and profile assets in Supabase, so edits are shared with all visitors and devices. GitHub-to-Supabase integration does not create the app's tables or configure its runtime secrets; complete these steps once:

1. Apply [`supabase/migrations/20261123135800_portfolio_content.sql`](./supabase/migrations/20261123135800_portfolio_content.sql) to your project. You can paste it into the Supabase **SQL Editor** and run it, or use the Supabase CLI migration workflow. It creates the portfolio content row, seeds the six sample projects, and creates the public-read `portfolio-media` storage bucket.
2. In **Project Settings → API**, copy the project URL, anon/public key, and service-role key. Never put the service-role key in browser code or commit it.
3. Add these values to `.env.local` for local development:

   ```dotenv
   ADMIN_PASSWORD=use-a-strong-private-password
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Add the same variables to your hosting provider's environment settings. Keep `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` private; only the two `NEXT_PUBLIC_` values are sent to the browser. The publishable key is safe for browser use; the service-role key is still required by the server API and must not be shared publicly.
5. Restart the local server or redeploy. Visit `/admin`, sign in, and manage projects, images, profile photo, and CV. Uploads go directly to Supabase Storage using short-lived signed upload tokens; the configured bucket limit is 50 MB per file.

The admin password is checked server-side. The login API creates a signed, HTTP-only session cookie. Public pages reload content when opened, when refocused, and every 30 seconds. Export/import JSON remains available as a backup and restore option.

- If an upload is rejected, check your Supabase Storage plan's global file-size limit; it must allow up to 50 MB.
- The contact form opens the visitor's default email app; it does not transmit or store form submissions.
- Replace the example social profile destinations in `components/portfolio.tsx` with your own profile URLs before launch.

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this project to a Git provider and import it in Vercel.
2. In **Project Settings → Environment Variables**, set `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production (and Preview if required).
3. Deploy. Vercel detects Next.js automatically; no `vercel.json` is necessary.
4. Visit `https://your-domain.example/admin` to manage the portfolio.

## Project structure

```text
app/
  admin/page.tsx
  api/admin/login/route.ts
  api/admin/media/sign/route.ts
  api/admin/portfolio/route.ts
  api/portfolio/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  admin-dashboard.tsx
  portfolio.tsx
lib/
  storage.ts
  works.ts
supabase/
  migrations/
    20261123135800_portfolio_content.sql
public/images/
```
