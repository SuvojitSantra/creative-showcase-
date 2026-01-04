# Suvojit's Gallery

A premium digital asset management and showcase platform designed and curated by **Suvojit Santra**. This project demonstrates a robust secure backend combined with a minimalist, high-performance frontend interface.



## Core Capabilities

- **Intelligent Masonry Grid**: A responsive, self-organizing layout engine that adapts to varying aspect ratios.
- **Secure Authentication**: Enterprise-grade identity management.
- **Private Workspaces**: Isolated dashboard environments for content curation.
- **Strict Role Separation**: Clean architectural distinction between public-facing galleries and private administration.

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 (App Router / Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Modular CSS + Design Tokens (Custom Design System created by Suvojit)

### Backend
- **Database**: PostgreSQL (Supabase)
- **Security**: Row Level Security (RLS) policies for granular access control.
- **Storage**: Object Storage with signed URLs.

## Local Development

### Prerequisites
- Node.js 18+
- Supabase Project Credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SuvojitSantra/creative-showcase-
   cd creative-showcase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

---

© 2024 Suvojit's Gallery. Designed & Built by **Suvojit Santra**.
