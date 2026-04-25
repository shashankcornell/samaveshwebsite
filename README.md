# Samavesh

A full-stack editorial platform for policy discourse and community engagement. Built for an organization that brings together policymakers, academics, fellows, and practitioners to discuss evidence-based solutions to public policy challenges.

**Live features:** content management, community profiles, topic-based discovery, annual gazette, and a premium editorial homepage.

---

## Overview

Samavesh is a production-ready web application with a public-facing editorial site and a private admin CMS. The platform supports multiple content formats (articles, essays, discourses, podcasts, op-eds), a structured contributor system, and role-based access control for editors and administrators.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS design system |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (credentials + JWT) |
| Image storage | Cloudinary (with local fallback) |
| Validation | Zod |

---

## Key Features

### Public Site
- **Editorial homepage** — split-hero layout with topic navigation, featured article, and a smart content grid that mixes content types by recency without repeating the same format consecutively
- **Content discovery** — browse by topic, content type, or date; full article pages with audio/video/embed support
- **Community directory** — profiles grouped by role (team, advisory board, fellows, presenters, discussants) with individual bio pages
- **Gazette** — annual curated collection with a distinct editorial layout
- **Responsive design** — desktop, tablet, and mobile layouts with a sticky navbar that integrates into the hero on the homepage

### Admin CMS
- Secure login with rate-limited authentication
- Full CRUD for content: title, slug, excerpt, body (rich text), thumbnail, audio/video/embed URLs, SEO fields, topic tags, and contributor roles
- Full CRUD for community profiles: bio, image, role, social links
- Dashboard with content stats (published, draft, archived)
- Image upload with Cloudinary or local filesystem

### Content Ordering Algorithm
The homepage grid uses a custom ordering algorithm: content is sorted by publish date (newest first), then reordered within a 6-item lookahead window to avoid showing more than 2 consecutive items of the same content type — ensuring editorial variety without sacrificing recency.

---

## Database Schema

```
User          — admin accounts with role-based permissions
Profile       — community member profiles
Content       — articles, essays, discourses, podcasts, op-eds, news
ContentType   — reusable content type definitions
TopicTag      — policy topics (Health, Education, Urbanisation, etc.)
ContentContributor — junction table linking profiles to content with roles (Author, Editor, Presenter, etc.)
ContentTopicTag    — junction table linking content to topic tags
```

---

## Project Structure

```
src/
├── app/
│   ├── (public)/        # Public-facing pages
│   │   ├── page.tsx     # Homepage with ordering algorithm
│   │   ├── blogs/       # Content listing and detail pages
│   │   ├── topics/      # Topic hub and detail pages
│   │   ├── community/   # Member directory and profiles
│   │   ├── gazette/     # Annual journal view
│   │   └── act/         # Summit, fellowship, externship info
│   ├── (admin)/         # Password-protected CMS
│   │   ├── content/     # Content management
│   │   └── community/   # Profile management
│   └── api/             # REST API routes
├── components/
│   ├── public/          # Editorial UI components
│   └── admin/           # CMS UI components
├── lib/                 # Prisma client, auth, validation, utilities
└── prisma/              # Schema and seed scripts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (optional — falls back to local storage)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, CLOUDINARY_* (optional)

# Run database migrations
npx prisma migrate dev

# Seed initial data (topics, content types)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS.

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/content` | List or create content |
| GET/PUT/DELETE | `/api/content/[id]` | Read, update, or delete content |
| POST | `/api/content/[id]/publish` | Toggle publish status |
| GET/POST | `/api/community` | List or create profiles |
| GET/PUT/DELETE | `/api/community/[id]` | Read, update, or delete profile |
| GET/POST | `/api/topics` | List or create topic tags |
| GET | `/api/content-types` | List content types |
| POST | `/api/upload` | Upload image (Cloudinary or local) |

---

## Design System

The site uses a custom CSS design system with:
- **Fonts:** Libre Caslon (serif, editorial), Montserrat (sans-serif, UI), Inconsolata (monospace, metadata)
- **Tokens:** ink, paper, hero-blue, hero-cream, accent-blue, accent-purple, and tint palette
- **Components:** animated underline nav, scroll-triggered reveal animations, card hover effects, modal popups, pill filters

---

## Author

Built by Shashank Mishra.  
Contact: sm2937@cornell.edu
