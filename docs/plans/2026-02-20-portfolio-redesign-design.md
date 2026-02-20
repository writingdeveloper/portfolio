# Portfolio Redesign: Developer Blog + Project Showcase

**Date:** 2026-02-20
**Domain:** writingdeveloper.blog
**Status:** Approved

## Overview

Rebuild the portfolio as a blog-centric developer platform that serves three purposes:
1. Personal dev blog (development stories, tutorials, startup journey)
2. Project marketing hub (Soursea and future projects)
3. Professional branding (skills, experience showcase)

Replaces the existing Ghost CMS installation (2 posts) with a self-hosted Next.js + Sanity CMS solution.

## Architecture

### Tech Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Sanity v3** (Headless CMS + embedded Studio)
- **Tailwind CSS 4** + **Framer Motion** (styling/animation)
- **next-intl** (Korean + English)
- **Vercel Pro** deployment

### Site Structure
```
writingdeveloper.blog
├── /                    (Home - latest posts + intro)
├── /blog                (Blog listing with filters)
├── /blog/[slug]         (Blog post detail)
├── /projects            (Project showcase - Soursea etc.)
├── /about               (About + skills/career)
└── /studio              (Sanity Studio - content management)
```

### Sanity Content Models
- **Post**: title, body (Portable Text), tags, category, cover image, language, SEO fields, reading time
- **Project**: name, description, screenshots, tech stack, links, status
- **Author**: name, bio, avatar, social links
- **Category**: name, slug, description (dev stories, tutorials, business, etc.)

## Design & UI/UX

### Design Concept: "Creative Professional Authenticity"

**Visual Style:**
- Dark mode default + light mode toggle
- Typography-centered (content is the star)
- Accent colors for personality (gradients, highlights)
- Generous whitespace for breathing room
- Subtle animations for liveliness (not overdone)

**Layout:**
- **Home**: Hero section (concise intro + CTA) → Latest blog posts → Project highlights
- **Blog listing**: Card grid or list view, category/tag filters
- **Blog detail**: Wide content area, TOC sidebar, reading time
- **Projects**: Visual cards + detail pages per project
- **About**: Storytelling-style intro + tech stack + career

**Navigation:**
- Top header (logo + menu + language toggle + dark/light toggle)
- Mobile: hamburger menu
- Header-based (not sidebar, since blog-centric)

**Responsive:**
- Mobile-first design
- Max-width constraint on blog posts for readability

### Custom Sanity Blocks (Portable Text)
- Code blocks with syntax highlighting + copy button
- Image gallery (multi-image slider/grid)
- Callout/note boxes (tip, warning, info)
- Embeds (YouTube, CodeSandbox, external pages)
- Project reference cards within blog posts

## SEO & Marketing

### SEO
- Per-page meta tags (title, description, keywords)
- Structured data: JSON-LD (Article, Person, Organization schemas)
- Auto-generated sitemap.xml
- Canonical URLs
- Core Web Vitals optimization

### Content Distribution
1. **Auto-generated:** RSS feed (`/feed.xml`), OG images, social share links
2. **Distribution channels:**
   - LinkedIn: dev stories + business insights
   - Reddit: r/webdev, r/nextjs, r/SideProject
   - X (Twitter): short threads + blog links
   - Hacker News: deep technical posts
   - Dev.to / Hashnode: cross-posting with canonical URL
   - Korean: GeekNews, Careerly

### Analytics
- Vercel Analytics (built-in) or Plausible/Umami (privacy-friendly)

## Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       ├── blog/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       ├── projects/page.tsx
│   │       ├── about/page.tsx
│   │       └── globals.css
│   ├── components/
│   │   ├── layout/          (Header, Footer, Navigation)
│   │   ├── blog/            (PostCard, PostList, TOC, ShareButtons)
│   │   ├── portable-text/   (Sanity block renderers)
│   │   ├── projects/        (ProjectCard, ProjectGrid)
│   │   └── ui/              (shared UI components)
│   ├── sanity/
│   │   ├── schemas/         (post, project, author, category)
│   │   ├── lib/             (client, queries, image builder)
│   │   └── studio/          (Sanity Studio config)
│   ├── i18n/
│   │   ├── routing.ts
│   │   └── request.ts
│   └── lib/
│       ├── utils.ts
│       └── seo.ts
├── messages/
│   ├── ko.json
│   └── en.json
├── sanity.config.ts
├── sanity.cli.ts
└── next.config.ts
```

### Key Packages
- `next-sanity` - Sanity + Next.js integration
- `@sanity/image-url` - image URL builder
- `@portabletext/react` - Portable Text rendering
- `next-intl` - i18n
- `framer-motion` - animations
- `lucide-react` - icons
- `shiki` or `sugar-high` - code syntax highlighting

## Languages
- Korean (default) + English
- UI translations via next-intl
- Blog posts can be in either language (language field in Sanity)
- Seamless language toggle
