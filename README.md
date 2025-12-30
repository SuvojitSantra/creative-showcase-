# Creative Showcase

A premium full-stack web application for artists to share digital memories. Built with Next.js 14, Supabase, and a custom Glassmorphism design system.

## Features
- **Masonry Layout**: Dynamic grid for displaying artwork.
- **Authentication**: Secure Login/Signup via Supabase.
- **Image Upload**: Drag & Drop upload to Supabase Storage.
- **User Dashboard**: Private management of uploads.
- **Public Profiles**: Shareable user galleries.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules (Glassmorphism design)
- **Backend/DB**: Supabase (Auth, Postgres, Storage)

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account

### Installation

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd "creative showcase"
   npm install
   ```

2. **Environment Setup**
   The `.env.local` is already configured with the provided credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xmqwlbjhzeqchxcbjdee.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Database Setup**
   Run the SQL schema in your Supabase SQL Editor (found in `supabase/schema.sql` - if you extracted it).
   *Note: The schema has already been provided and assumed running.*

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## Deployment (Vercel)

1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy.

## Project Structure
- `src/app`: App Router pages.
- `src/components`: Reusable UI components.
- `src/utils/supabase`: Client/Server helpers.
- `src/app/globals.css`: Design system variables.
