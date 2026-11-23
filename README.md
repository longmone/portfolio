# Mawuli Christoson — Portfolio

A vibrant, responsive portfolio built with Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.

## Run locally

1. Install Node.js 20.9+.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` to a strong private value. Use a separate production value in Vercel.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Admin and portfolio content

- Open `/admin` and sign in with the `ADMIN_PASSWORD` configured in `.env.local`.
- Add, edit, delete, feature, and reorder work. The homepage updates immediately in the same browser.
- Upload several project images, a profile photo, and a CV. Images and CVs are encoded as Base64 and saved in browser local storage.
- Export a JSON backup regularly; import that JSON in another browser to restore works.
- Work content and uploaded media are **per-browser** and are not shared across visitors or browsers. Clear browser storage only after exporting a backup.
- Browser local storage is limited. Keep each upload under 1.2 MB and optimize images before uploading. For shared content, larger media, and cross-device editing, replace the local storage helpers in `lib/storage.ts` with a database and object storage such as Supabase.
- The contact form opens the visitor's default email app; it does not transmit or store form submissions.
- Replace the example social profile destinations in `components/portfolio.tsx` with your own profile URLs before launch.

The admin password is checked server-side. The login API creates a signed, HTTP-only session cookie; `ADMIN_PASSWORD` must be configured on the deployment.

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this project to a Git provider and import it in Vercel.
2. In **Project Settings → Environment Variables**, set `ADMIN_PASSWORD` to a strong private value for Production (and Preview if required).
3. Deploy. Vercel detects Next.js automatically; no `vercel.json` is necessary.
4. Visit `https://your-domain.example/admin` to manage the portfolio.

## Project structure

```text
app/
  admin/page.tsx
  api/admin/login/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  admin-dashboard.tsx
  portfolio.tsx
lib/
  storage.ts
  works.ts
public/images/
```
