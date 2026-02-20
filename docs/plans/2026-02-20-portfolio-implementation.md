# Portfolio Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild writingdeveloper.blog as a blog-centric developer platform with Sanity CMS, replacing the current dashboard-style portfolio.

**Architecture:** Next.js 16 App Router with Sanity v3+ as headless CMS. Blog posts managed via embedded Sanity Studio at `/studio`. Site supports Korean + English via next-intl. Static generation with ISR for blog content.

**Tech Stack:** Next.js 16, TypeScript, Sanity v3+ (next-sanity), Tailwind CSS 4, Framer Motion, next-intl, @portabletext/react, shiki

---

## Phase 1: Project Reset & Foundation

### Task 1: Clean existing source code

**Files:**
- Delete: `src/components/sections/` (all 6 section files)
- Delete: `src/components/layout/Sidebar.tsx`
- Delete: `src/components/layout/MobileNav.tsx`
- Delete: `src/components/layout/LanguageSwitcher.tsx`
- Delete: `src/components/ui/Card.tsx`
- Delete: `src/components/ui/MetricCard.tsx`
- Delete: `src/components/ui/SectionHeader.tsx`
- Delete: `src/app/[locale]/about/`
- Delete: `src/app/[locale]/contact/`
- Delete: `src/app/[locale]/tech-stack/`
- Delete: `src/app/[locale]/timeline/`
- Delete: `src/app/[locale]/ventures/`
- Delete: `messages/zh.json`, `messages/ja.json`, `messages/es.json`
- Keep: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/app/[locale]/globals.css`, `src/i18n/`, `src/middleware.ts`, `messages/ko.json`, `messages/en.json`

**Step 1: Delete old components and pages**

```bash
rm -rf src/components/sections src/components/layout src/components/ui
rm -rf src/app/\[locale\]/about src/app/\[locale\]/contact src/app/\[locale\]/tech-stack src/app/\[locale\]/timeline src/app/\[locale\]/ventures
rm messages/zh.json messages/ja.json messages/es.json
```

**Step 2: Create new directory structure**

```bash
mkdir -p src/components/layout src/components/blog src/components/portable-text src/components/projects src/components/ui
mkdir -p src/sanity/schemas src/sanity/lib
mkdir -p src/lib
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: clean old portfolio code, prepare for redesign"
```

---

### Task 2: Install new dependencies

**Step 1: Install Sanity and related packages**

```bash
npm install next-sanity @sanity/image-url @portabletext/react
```

Note: `next-sanity` automatically installs `sanity` and `styled-components` as peer dependencies.

**Step 2: Install code syntax highlighting**

```bash
npm install shiki
```

**Step 3: Verify installation**

```bash
npm ls next-sanity sanity @sanity/image-url @portabletext/react shiki
```

Expected: all packages listed without errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install Sanity CMS and syntax highlighting dependencies"
```

---

### Task 3: Create Sanity project and configure

**Prerequisite:** You need a Sanity project. Create one at https://www.sanity.io/manage or run `npx sanity@latest init` and follow prompts. Get the project ID and dataset name.

**Files:**
- Create: `sanity.config.ts`
- Create: `sanity.cli.ts`
- Create: `.env.local`
- Modify: `next.config.ts`

**Step 1: Create `.env.local`**

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_SANITY_DATASET=production
```

**Step 2: Create `sanity.config.ts`**

```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
```

**Step 3: Create `sanity.cli.ts`**

```typescript
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  },
})
```

**Step 4: Update `next.config.ts`**

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

**Step 5: Create empty schema index (placeholder)**

```typescript
// src/sanity/schemas/index.ts
export const schemaTypes: any[] = []
```

**Step 6: Verify build doesn't error**

```bash
npm run build
```

Expected: Build succeeds (may have warnings about empty schemas, that's fine).

**Step 7: Commit**

```bash
git add sanity.config.ts sanity.cli.ts next.config.ts src/sanity/schemas/index.ts
git commit -m "feat: configure Sanity CMS project and Next.js integration"
```

Note: Do NOT commit `.env.local` — it contains secrets and is in `.gitignore`.

---

## Phase 2: Sanity Schemas & Data Layer

### Task 4: Create Author schema

**Files:**
- Create: `src/sanity/schemas/author.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create author schema**

```typescript
// src/sanity/schemas/author.ts
import { defineType, defineField } from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'github', title: 'GitHub', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url' }),
        defineField({ name: 'twitter', title: 'X (Twitter)', type: 'url' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', media: 'avatar' },
  },
})
```

**Step 2: Update schema index**

```typescript
// src/sanity/schemas/index.ts
import { authorType } from './author'

export const schemaTypes = [authorType]
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add Author schema for Sanity CMS"
```

---

### Task 5: Create Category schema

**Files:**
- Create: `src/sanity/schemas/category.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create category schema**

```typescript
// src/sanity/schemas/category.ts
import { defineType, defineField } from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
})
```

**Step 2: Update schema index**

```typescript
// src/sanity/schemas/index.ts
import { authorType } from './author'
import { categoryType } from './category'

export const schemaTypes = [authorType, categoryType]
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add Category schema for Sanity CMS"
```

---

### Task 6: Create Post schema

**Files:**
- Create: `src/sanity/schemas/post.ts`
- Create: `src/sanity/schemas/blocks/codeBlock.ts`
- Create: `src/sanity/schemas/blocks/callout.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create custom block types**

```typescript
// src/sanity/schemas/blocks/codeBlock.ts
import { defineType, defineField } from 'sanity'

export const codeBlockType = defineType({
  name: 'codeBlock',
  title: 'Code Block',
  type: 'object',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'TypeScript', value: 'typescript' },
          { title: 'JavaScript', value: 'javascript' },
          { title: 'Python', value: 'python' },
          { title: 'Rust', value: 'rust' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'Bash', value: 'bash' },
          { title: 'JSON', value: 'json' },
          { title: 'SQL', value: 'sql' },
          { title: 'Go', value: 'go' },
        ],
      },
    }),
    defineField({
      name: 'filename',
      title: 'Filename',
      type: 'string',
    }),
  ],
  preview: {
    select: { language: 'language', filename: 'filename' },
    prepare({ language, filename }) {
      return {
        title: filename || 'Code Block',
        subtitle: language || 'plain text',
      }
    },
  },
})
```

```typescript
// src/sanity/schemas/blocks/callout.ts
import { defineType, defineField } from 'sanity'

export const calloutType = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Tip', value: 'tip' },
          { title: 'Error', value: 'error' },
        ],
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { type: 'type', text: 'text' },
    prepare({ type, text }) {
      return { title: `${type?.toUpperCase()}: ${text?.substring(0, 50)}` }
    },
  },
})
```

**Step 2: Create post schema**

```typescript
// src/sanity/schemas/post.ts
import { defineType, defineField, defineArrayMember } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'Korean', value: 'ko' },
          { title: 'English', value: 'en' },
        ],
      },
      initialValue: 'ko',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strikethrough', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({ name: 'href', type: 'url', title: 'URL' }),
                  defineField({ name: 'blank', type: 'boolean', title: 'Open in new tab', initialValue: true }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
          ],
        }),
        defineArrayMember({ type: 'codeBlock' }),
        defineArrayMember({ type: 'callout' }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string' }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2 }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare({ title, author, media }) {
      return { title, subtitle: author ? `by ${author}` : '', media }
    },
  },
})
```

**Step 3: Update schema index**

```typescript
// src/sanity/schemas/index.ts
import { authorType } from './author'
import { categoryType } from './category'
import { postType } from './post'
import { codeBlockType } from './blocks/codeBlock'
import { calloutType } from './blocks/callout'

export const schemaTypes = [
  authorType,
  categoryType,
  postType,
  codeBlockType,
  calloutType,
]
```

**Step 4: Commit**

```bash
mkdir -p src/sanity/schemas/blocks
git add src/sanity/schemas/
git commit -m "feat: add Post schema with custom blocks (code, callout)"
```

---

### Task 7: Create Project schema

**Files:**
- Create: `src/sanity/schemas/project.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create project schema**

```typescript
// src/sanity/schemas/project.ts
import { defineType, defineField } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Building', value: 'building' },
          { title: 'Launched', value: 'launched' },
          { title: 'Archived', value: 'archived' },
        ],
      },
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'object',
      fields: [
        defineField({ name: 'website', title: 'Website', type: 'url' }),
        defineField({ name: 'github', title: 'GitHub', type: 'url' }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  orderings: [
    { title: 'Display Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'status', media: 'logo' },
  },
})
```

**Step 2: Update schema index**

```typescript
// src/sanity/schemas/index.ts
import { authorType } from './author'
import { categoryType } from './category'
import { postType } from './post'
import { projectType } from './project'
import { codeBlockType } from './blocks/codeBlock'
import { calloutType } from './blocks/callout'

export const schemaTypes = [
  authorType,
  categoryType,
  postType,
  projectType,
  codeBlockType,
  calloutType,
]
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add Project schema for Sanity CMS"
```

---

### Task 8: Set up Sanity client, queries, and image helper

**Files:**
- Create: `src/sanity/lib/client.ts`
- Create: `src/sanity/lib/queries.ts`
- Create: `src/sanity/lib/image.ts`

**Step 1: Create Sanity client**

```typescript
// src/sanity/lib/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-07-11',
  useCdn: true,
})
```

**Step 2: Create GROQ queries**

```typescript
// src/sanity/lib/queries.ts
import { defineQuery } from 'next-sanity'

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...$limit]{
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    language,
    tags,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, avatar },
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  }`
)

export const POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    excerpt,
    body,
    publishedAt,
    language,
    tags,
    seo,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, bio, avatar, social },
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  }`
)

export const POSTS_BY_CATEGORY_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current) && $categorySlug in categories[]->slug.current] | order(publishedAt desc){
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    language,
    tags,
    "categories": categories[]->{ _id, title, slug },
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      alt
    }
  }`
)

export const CATEGORIES_QUERY = defineQuery(
  `*[_type == "category"] | order(title asc){
    _id,
    title,
    slug,
    description
  }`
)

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project"] | order(order asc){
    _id,
    name,
    slug,
    description,
    logo {
      asset->{ _id, url },
    },
    techStack,
    status,
    links,
    featured
  }`
)

export const ALL_POST_SLUGS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`
)
```

**Step 3: Create image URL helper**

```typescript
// src/sanity/lib/image.ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
```

**Step 4: Commit**

```bash
git add src/sanity/lib/
git commit -m "feat: add Sanity client, GROQ queries, and image helper"
```

---

### Task 9: Embed Sanity Studio at /studio

**Files:**
- Create: `src/app/studio/[[...tool]]/page.tsx`
- Create: `src/app/studio/[[...tool]]/layout.tsx`

**Step 1: Create Studio layout (bypasses i18n and main layout)**

```tsx
// src/app/studio/[[...tool]]/layout.tsx
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**Step 2: Create Studio page**

```tsx
// src/app/studio/[[...tool]]/page.tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

**Step 3: Update middleware to exclude /studio from i18n routing**

Check the current middleware and ensure `/studio` is excluded. The middleware should have a matcher that excludes `/studio`.

Modify `src/middleware.ts` to add `/studio` to the exclusion list:

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|studio|.*\\..*).*)',
  ],
};
```

**Step 4: Verify Studio loads**

```bash
npm run dev
```

Navigate to `http://localhost:3000/studio` — Sanity Studio should load.

**Step 5: Commit**

```bash
git add src/app/studio/ src/middleware.ts
git commit -m "feat: embed Sanity Studio at /studio route"
```

---

## Phase 3: i18n & Layout

### Task 10: Update i18n for Korean + English only

**Files:**
- Modify: `src/i18n/routing.ts`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Update routing to only support ko + en**

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
});
```

Note: `localePrefix: 'as-needed'` means the default locale (ko) won't have a prefix in the URL. English will be at `/en/...`.

**Step 2: Replace translation files with new structure**

```json
// messages/ko.json
{
  "metadata": {
    "title": "WritingDeveloper",
    "description": "개발 이야기, 기술 튜토리얼, 그리고 스타트업 여정"
  },
  "nav": {
    "home": "홈",
    "blog": "블로그",
    "projects": "프로젝트",
    "about": "소개"
  },
  "home": {
    "hero": {
      "greeting": "안녕하세요",
      "name": "이시형",
      "role": "개발자 & 창업가",
      "description": "코드로 문제를 해결하고, 글로 경험을 나눕니다."
    },
    "latestPosts": "최근 글",
    "viewAll": "모두 보기",
    "featuredProjects": "프로젝트"
  },
  "blog": {
    "title": "블로그",
    "description": "개발, 기술, 스타트업에 대한 이야기",
    "allCategories": "전체",
    "readMore": "더 읽기",
    "readingTime": "분 소요",
    "noPosts": "글이 없습니다."
  },
  "projects": {
    "title": "프로젝트",
    "description": "만들고 있는 것들",
    "viewProject": "프로젝트 보기",
    "viewCode": "코드 보기"
  },
  "about": {
    "title": "소개",
    "description": "개발자이자 창업가로서의 여정"
  },
  "common": {
    "backToHome": "홈으로",
    "sharePost": "공유하기",
    "tableOfContents": "목차",
    "tags": "태그"
  },
  "footer": {
    "copyright": "All rights reserved."
  }
}
```

```json
// messages/en.json
{
  "metadata": {
    "title": "WritingDeveloper",
    "description": "Dev stories, tech tutorials, and startup journey"
  },
  "nav": {
    "home": "Home",
    "blog": "Blog",
    "projects": "Projects",
    "about": "About"
  },
  "home": {
    "hero": {
      "greeting": "Hello",
      "name": "Si Hyeong Lee",
      "role": "Developer & Entrepreneur",
      "description": "Solving problems with code, sharing experiences through writing."
    },
    "latestPosts": "Latest Posts",
    "viewAll": "View All",
    "featuredProjects": "Projects"
  },
  "blog": {
    "title": "Blog",
    "description": "Stories about development, technology, and startups",
    "allCategories": "All",
    "readMore": "Read More",
    "readingTime": "min read",
    "noPosts": "No posts yet."
  },
  "projects": {
    "title": "Projects",
    "description": "Things I'm building",
    "viewProject": "View Project",
    "viewCode": "View Code"
  },
  "about": {
    "title": "About",
    "description": "My journey as a developer and entrepreneur"
  },
  "common": {
    "backToHome": "Back to Home",
    "sharePost": "Share",
    "tableOfContents": "Table of Contents",
    "tags": "Tags"
  },
  "footer": {
    "copyright": "All rights reserved."
  }
}
```

**Step 3: Update `src/i18n/navigation.ts`**

```typescript
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

**Step 4: Commit**

```bash
git add src/i18n/ messages/
git commit -m "feat: update i18n for Korean + English with new translation keys"
```

---

### Task 11: Create root layout with theme support

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/globals.css`

**Step 1: Rewrite root layout**

```tsx
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages({ locale })
  const meta = (messages as any).metadata

  return {
    title: {
      default: meta?.title || 'WritingDeveloper',
      template: `%s | ${meta?.title || 'WritingDeveloper'}`,
    },
    description: meta?.description,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Step 2: Rewrite globals.css**

```css
/* src/app/[locale]/globals.css */
@import "tailwindcss";

:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-accent: #10b981;
}

/* Dark mode (default) */
.dark {
  color-scheme: dark;
}

/* Light mode */
.light {
  color-scheme: light;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Selection color */
::selection {
  background-color: rgba(59, 130, 246, 0.3);
}

/* Scrollbar styling (webkit) */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}

/* Prose-like typography for blog content */
.prose-content {
  line-height: 1.8;
  font-size: 1.0625rem;
}

.prose-content > * + * {
  margin-top: 1.5em;
}

.prose-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2.5em;
  margin-bottom: 0.75em;
}

.prose-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 0.5em;
}

.prose-content p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose-content a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose-content a:hover {
  color: var(--color-primary-dark);
}

.prose-content blockquote {
  border-left: 3px solid var(--color-primary);
  padding-left: 1rem;
  font-style: italic;
  color: #9ca3af;
}

.prose-content ul, .prose-content ol {
  padding-left: 1.5em;
}

.prose-content li {
  margin-top: 0.5em;
}

.prose-content img {
  border-radius: 0.5rem;
  max-width: 100%;
}

.prose-content code:not(pre code) {
  background: #1f2937;
  padding: 0.15em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.9em;
}
```

**Step 3: Commit**

```bash
git add src/app/\[locale\]/layout.tsx src/app/\[locale\]/globals.css
git commit -m "feat: rewrite root layout with theme support and blog typography"
```

---

### Task 12: Create Header component

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/LanguageToggle.tsx`
- Create: `src/components/layout/ThemeToggle.tsx`

**Step 1: Create ThemeToggle**

```tsx
// src/components/layout/ThemeToggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

**Step 2: Create LanguageToggle**

```tsx
// src/components/layout/LanguageToggle.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function toggle() {
    const next = locale === 'ko' ? 'en' : 'ko'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
      aria-label="Switch language"
    >
      <Globe size={16} />
      <span className="uppercase font-medium">{locale}</span>
    </button>
  )
}
```

**Step 3: Create Header**

```tsx
// src/components/layout/Header.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/blog', key: 'blog' },
  { href: '/projects', key: 'projects' },
  { href: '/about', key: 'about' },
] as const

export function Header() {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          WritingDeveloper
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-gray-800/50"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Header with navigation, language toggle, and theme toggle"
```

---

### Task 13: Create Footer component and wire up layout

**Files:**
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/[locale]/layout.tsx` (add Header + Footer)

**Step 1: Create Footer**

```tsx
// src/components/layout/Footer.tsx
import { useTranslations } from 'next-intl'
import { Github, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-800/50 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          &copy; {year} WritingDeveloper. {t('copyright')}
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Github size={18} />
          </a>
          <a href="https://linkedin.com/in/writingdeveloper" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Linkedin size={18} />
          </a>
          <a href="https://twitter.com/writingdev" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
            <Twitter size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
```

**Step 2: Update root layout to include Header and Footer**

Add to `src/app/[locale]/layout.tsx`, inside the `<body>` and `<NextIntlClientProvider>`:

```tsx
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Inside the provider:
<NextIntlClientProvider messages={messages}>
  <Header />
  <main className="max-w-5xl mx-auto px-4 py-8">
    {children}
  </main>
  <Footer />
</NextIntlClientProvider>
```

**Step 3: Verify dev server runs**

```bash
npm run dev
```

Navigate to `http://localhost:3000` — should see header and footer.

**Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx src/app/\[locale\]/layout.tsx
git commit -m "feat: add Footer and wire Header/Footer into root layout"
```

---

## Phase 4: Pages

### Task 14: Create Home page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Rewrite home page**

```tsx
// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { POSTS_QUERY, PROJECTS_QUERY } from '@/sanity/lib/queries'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import { ProjectCard } from '@/components/projects/ProjectCard'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [posts, projects] = await Promise.all([
    client.fetch(POSTS_QUERY, { limit: 3 }),
    client.fetch(PROJECTS_QUERY),
  ])

  return <HomeContent posts={posts} projects={projects} />
}

function HomeContent({ posts, projects }: { posts: any[]; projects: any[] }) {
  const t = useTranslations('home')

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="pt-12 pb-8">
        <p className="text-gray-400 text-lg mb-2">{t('hero.greeting')}</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('hero.name')}</h1>
        <p className="text-xl text-blue-400 mb-4">{t('hero.role')}</p>
        <p className="text-gray-400 max-w-xl text-lg">{t('hero.description')}</p>
      </section>

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{t('latestPosts')}</h2>
          <Link href="/blog" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">{t('featuredProjects')}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.filter((p: any) => p.featured).map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

**Step 2: Commit (page will have import errors until PostCard/ProjectCard are created — that's expected)**

```bash
git add src/app/\[locale\]/page.tsx
git commit -m "feat: create home page with hero, latest posts, and projects"
```

---

### Task 15: Create PostCard and ProjectCard components

**Files:**
- Create: `src/components/blog/PostCard.tsx`
- Create: `src/components/projects/ProjectCard.tsx`

**Step 1: Create PostCard**

```tsx
// src/components/blog/PostCard.tsx
import { Link } from '@/i18n/navigation'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface PostCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    excerpt?: string
    publishedAt?: string
    mainImage?: any
    categories?: { title: string }[]
    tags?: string[]
  }
}

export function PostCard({ post }: PostCardProps) {
  const t = useTranslations('blog')

  return (
    <Link href={`/blog/${post.slug.current}`}>
      <article className="group rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden hover:border-gray-700 transition-all hover:-translate-y-1">
        {post.mainImage && (
          <div className="aspect-[16/9] overflow-hidden">
            <Image
              src={urlFor(post.mainImage).width(600).height(340).url()}
              alt={post.mainImage.alt || post.title}
              width={600}
              height={340}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-2">
              {post.categories.map((cat) => (
                <span key={cat.title} className="text-xs text-blue-400 font-medium">
                  {cat.title}
                </span>
              ))}
            </div>
          )}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
          )}
          {post.publishedAt && (
            <time className="text-xs text-gray-500 mt-3 block">
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>
      </article>
    </Link>
  )
}
```

**Step 2: Create ProjectCard**

```tsx
// src/components/projects/ProjectCard.tsx
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { ExternalLink, Github } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
    logo?: any
    techStack?: string[]
    status?: string
    links?: { website?: string; github?: string }
  }
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  building: 'bg-amber-500/20 text-amber-400',
  launched: 'bg-blue-500/20 text-blue-400',
  archived: 'bg-gray-500/20 text-gray-400',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects')

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 transition-all">
      <div className="flex items-start gap-4 mb-4">
        {project.logo && (
          <Image
            src={urlFor(project.logo).width(48).height(48).url()}
            alt={project.name}
            width={48}
            height={48}
            className="rounded-lg"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            {project.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] || statusColors.archived}`}>
                {project.status}
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map((tech) => (
            <span key={tech} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {project.links?.website && (
          <a href={project.links.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ExternalLink size={14} /> {t('viewProject')}
          </a>
        )}
        {project.links?.github && (
          <a href={project.links.github} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <Github size={14} /> {t('viewCode')}
          </a>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/blog/PostCard.tsx src/components/projects/ProjectCard.tsx
git commit -m "feat: add PostCard and ProjectCard components"
```

---

### Task 16: Create Blog listing page

**Files:**
- Create: `src/app/[locale]/blog/page.tsx`

**Step 1: Create blog listing page**

```tsx
// src/app/[locale]/blog/page.tsx
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { POSTS_QUERY, CATEGORIES_QUERY } from '@/sanity/lib/queries'
import { PostCard } from '@/components/blog/PostCard'

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [posts, categories] = await Promise.all([
    client.fetch(POSTS_QUERY, { limit: 50 }),
    client.fetch(CATEGORIES_QUERY),
  ])

  return <BlogContent posts={posts} categories={categories} />
}

function BlogContent({ posts, categories }: { posts: any[]; categories: any[] }) {
  const t = useTranslations('blog')

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </header>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1.5 rounded-full text-sm bg-blue-500/20 text-blue-400 cursor-pointer">
            {t('allCategories')}
          </span>
          {categories.map((cat: any) => (
            <span key={cat._id} className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
              {cat.title}
            </span>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">{t('noPosts')}</p>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
mkdir -p src/app/\[locale\]/blog
git add src/app/\[locale\]/blog/page.tsx
git commit -m "feat: add blog listing page with category filters"
```

---

### Task 17: Create Blog post detail page with Portable Text

**Files:**
- Create: `src/app/[locale]/blog/[slug]/page.tsx`
- Create: `src/components/portable-text/PortableTextRenderer.tsx`
- Create: `src/components/portable-text/CodeBlock.tsx`
- Create: `src/components/portable-text/Callout.tsx`

**Step 1: Create CodeBlock component**

```tsx
// src/components/portable-text/CodeBlock.tsx
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  value: {
    code: string
    language?: string
    filename?: string
  }
}

export function CodeBlock({ value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard.writeText(value.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-800">
      {(value.filename || value.language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 text-xs text-gray-400">
          <span>{value.filename || value.language}</span>
          <button onClick={copyCode} className="flex items-center gap-1 hover:text-white transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-gray-900 text-sm">
        <code>{value.code}</code>
      </pre>
    </div>
  )
}
```

**Step 2: Create Callout component**

```tsx
// src/components/portable-text/Callout.tsx
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react'

interface CalloutProps {
  value: {
    type: 'info' | 'warning' | 'tip' | 'error'
    text: string
  }
}

const calloutStyles = {
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
  tip: { icon: Lightbulb, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  error: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300' },
}

export function Callout({ value }: CalloutProps) {
  const style = calloutStyles[value.type] || calloutStyles.info
  const Icon = style.icon

  return (
    <div className={`my-6 rounded-lg border ${style.border} ${style.bg} p-4 flex gap-3`}>
      <Icon size={20} className={`${style.text} shrink-0 mt-0.5`} />
      <p className={`${style.text} text-sm`}>{value.text}</p>
    </div>
  )
}
```

**Step 3: Create PortableTextRenderer**

```tsx
// src/components/portable-text/PortableTextRenderer.tsx
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref && !value?.asset?._id) return null
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).quality(80).auto('format').url()}
            alt={value.alt || 'Image'}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    codeBlock: ({ value }) => <CodeBlock value={value} />,
    callout: ({ value }) => <Callout value={value} />,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm">{children}</code>
    ),
  },
  block: {
    h2: ({ children, value }) => (
      <h2 id={value._key} className="text-2xl font-bold mt-10 mb-4 scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={value._key} className="text-xl font-semibold mt-8 mb-3 scroll-mt-20">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-3 border-blue-500 pl-4 italic text-gray-400 my-6">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>,
  },
}

export function PortableTextRenderer({ value }: { value: any }) {
  return (
    <div className="prose-content">
      <PortableText value={value} components={components} />
    </div>
  )
}
```

**Step 4: Create blog detail page**

```tsx
// src/app/[locale]/blog/[slug]/page.tsx
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { POST_BY_SLUG_QUERY, ALL_POST_SLUGS_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_POST_SLUGS_QUERY)
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug })
  if (!post) return {}

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      ...(post.mainImage && {
        images: [urlFor(post.mainImage).width(1200).height(630).url()],
      }),
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug })
  if (!post) notFound()

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        {post.categories && post.categories.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.categories.map((cat: any) => (
              <span key={cat._id} className="text-sm text-blue-400 font-medium">
                {cat.title}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {post.author && <span>{post.author.name}</span>}
          {post.publishedAt && (
            <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
          )}
        </div>
      </header>

      {/* Cover image */}
      {post.mainImage && (
        <div className="mb-10 rounded-xl overflow-hidden">
          <Image
            src={urlFor(post.mainImage).width(1200).height(630).url()}
            alt={post.mainImage.alt || post.title}
            width={1200}
            height={630}
            className="w-full h-auto"
            priority
          />
        </div>
      )}

      {/* Body */}
      {post.body && <PortableTextRenderer value={post.body} />}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
```

**Step 5: Commit**

```bash
git add src/components/portable-text/ src/app/\[locale\]/blog/\[slug\]/
git commit -m "feat: add blog post detail page with Portable Text rendering"
```

---

### Task 18: Create Projects page

**Files:**
- Create: `src/app/[locale]/projects/page.tsx`

**Step 1: Create projects page**

```tsx
// src/app/[locale]/projects/page.tsx
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { PROJECTS_QUERY } from '@/sanity/lib/queries'
import { ProjectCard } from '@/components/projects/ProjectCard'

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const projects = await client.fetch(PROJECTS_QUERY)

  return <ProjectsContent projects={projects} />
}

function ProjectsContent({ projects }: { projects: any[] }) {
  const t = useTranslations('projects')

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project: any) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
mkdir -p src/app/\[locale\]/projects
git add src/app/\[locale\]/projects/page.tsx
git commit -m "feat: add Projects showcase page"
```

---

### Task 19: Create About page

**Files:**
- Create: `src/app/[locale]/about/page.tsx`

**Step 1: Create about page**

```tsx
// src/app/[locale]/about/page.tsx
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </header>

      <div className="prose-content text-gray-300 space-y-6">
        {/* Content will be expanded later — this is the structural shell */}
        <p>
          개발자이자 창업가로서 기술로 문제를 해결하고 있습니다.
          Soursea를 비롯한 프로젝트들을 만들고 운영하고 있으며,
          그 과정에서 배운 것들을 이 블로그를 통해 공유합니다.
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
mkdir -p src/app/\[locale\]/about
git add src/app/\[locale\]/about/page.tsx
git commit -m "feat: add About page shell"
```

---

## Phase 5: SEO & Distribution

### Task 20: Add SEO utilities and JSON-LD

**Files:**
- Create: `src/lib/seo.ts`

**Step 1: Create SEO helper**

```typescript
// src/lib/seo.ts
export function generateArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  authorName,
}: {
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedAt: string
  authorName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: imageUrl,
    datePublished: publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Person',
      name: 'WritingDeveloper',
    },
  }
}

export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Si Hyeong Lee',
    url: 'https://writingdeveloper.blog',
    jobTitle: 'Developer & Entrepreneur',
    sameAs: [
      'https://github.com/writingdeveloper',
      'https://linkedin.com/in/writingdeveloper',
    ],
  }
}
```

**Step 2: Add JSON-LD to blog post page**

In `src/app/[locale]/blog/[slug]/page.tsx`, add inside the article component, before the header:

```tsx
import { generateArticleJsonLd } from '@/lib/seo'

// Inside the component, before the return's first element:
const jsonLd = generateArticleJsonLd({
  title: post.title,
  description: post.excerpt || '',
  url: `https://writingdeveloper.blog/blog/${slug}`,
  imageUrl: post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined,
  publishedAt: post.publishedAt || '',
  authorName: post.author?.name || 'WritingDeveloper',
})

// Add this as the first child inside <article>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

**Step 3: Commit**

```bash
git add src/lib/seo.ts src/app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "feat: add SEO utilities with JSON-LD structured data"
```

---

### Task 21: Add RSS feed

**Files:**
- Create: `src/app/feed.xml/route.ts`

**Step 1: Create RSS feed route**

```typescript
// src/app/feed.xml/route.ts
import { client } from '@/sanity/lib/client'

const SITE_URL = 'https://writingdeveloper.blog'

export async function GET() {
  const posts = await client.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...50]{
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->name
    }`
  )

  const items = posts
    .map(
      (post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug.current}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug.current}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.author ? `<author>${post.author}</author>` : ''}
    </item>`
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WritingDeveloper</title>
    <link>${SITE_URL}</link>
    <description>Dev stories, tech tutorials, and startup journey</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

**Step 2: Commit**

```bash
mkdir -p src/app/feed.xml
git add src/app/feed.xml/route.ts
git commit -m "feat: add RSS feed at /feed.xml"
```

---

### Task 22: Add sitemap

**Files:**
- Create: `src/app/sitemap.ts`

**Step 1: Create sitemap**

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

const SITE_URL = 'https://writingdeveloper.blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(
    `*[_type == "post" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    }`
  )

  const postUrls = posts.map((post: any) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...postUrls,
  ]
}
```

**Step 2: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add dynamic sitemap.xml generation"
```

---

## Phase 6: Polish & Animations

### Task 23: Add Framer Motion page transitions

**Files:**
- Create: `src/components/ui/PageTransition.tsx`

**Step 1: Create PageTransition wrapper**

```tsx
// src/components/ui/PageTransition.tsx
'use client'

import { motion } from 'framer-motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

**Step 2: Wrap page content in each page**

In each page component (home, blog, blog/[slug], projects, about), wrap the return content with `<PageTransition>`:

```tsx
import { PageTransition } from '@/components/ui/PageTransition'

// In the return:
return (
  <PageTransition>
    {/* existing content */}
  </PageTransition>
)
```

**Step 3: Commit**

```bash
git add src/components/ui/PageTransition.tsx src/app/
git commit -m "feat: add page transition animations with Framer Motion"
```

---

### Task 24: Add share buttons to blog posts

**Files:**
- Create: `src/components/blog/ShareButtons.tsx`

**Step 1: Create ShareButtons**

```tsx
// src/components/blog/ShareButtons.tsx
'use client'

import { Linkedin, Twitter, Link as LinkIcon, Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('common')

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 mt-8">
      <span className="text-sm text-gray-500 mr-1">{t('sharePost')}</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        <Twitter size={16} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        <Linkedin size={16} />
      </a>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
    </div>
  )
}
```

**Step 2: Add ShareButtons to blog post page**

In `src/app/[locale]/blog/[slug]/page.tsx`, add after the tags section:

```tsx
import { ShareButtons } from '@/components/blog/ShareButtons'

// After the tags div:
<ShareButtons
  url={`https://writingdeveloper.blog/blog/${slug}`}
  title={post.title}
/>
```

**Step 3: Commit**

```bash
git add src/components/blog/ShareButtons.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "feat: add social share buttons to blog posts"
```

---

### Task 25: Final build verification

**Step 1: Run lint**

```bash
npm run lint
```

Fix any lint errors.

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds. Note any warnings and fix if critical.

**Step 3: Test locally**

```bash
npm run start
```

Navigate to all pages and verify they render:
- `/` (home)
- `/blog` (blog listing)
- `/projects` (projects)
- `/about` (about)
- `/studio` (Sanity Studio)
- `/en/` (English home)
- `/feed.xml` (RSS feed)

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: fix lint errors and verify production build"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Project reset, install deps, configure Sanity |
| 2 | 4-9 | Sanity schemas (author, category, post, project), data layer, Studio |
| 3 | 10-13 | i18n, root layout, Header, Footer |
| 4 | 14-19 | Home, PostCard, ProjectCard, Blog listing, Blog detail, Projects, About |
| 5 | 20-22 | SEO (JSON-LD), RSS feed, Sitemap |
| 6 | 23-25 | Animations, share buttons, final verification |

**Total: 25 tasks across 6 phases**

After completing all tasks, the site will be ready for:
1. Content creation in Sanity Studio at `/studio`
2. Deployment to Vercel
3. Custom domain setup (writingdeveloper.blog)
