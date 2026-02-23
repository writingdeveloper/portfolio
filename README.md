# WritingDeveloper Portfolio

Personal developer blog and project showcase at [writingdeveloper.blog](https://writingdeveloper.blog).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Content:** MDX (file-based)
- **i18n:** next-intl (Korean + English)
- **Syntax Highlighting:** Shiki
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
content/          # MDX posts, project data, about data
messages/         # i18n translation files (ko.json, en.json)
src/
  app/            # Next.js App Router pages
  components/     # React components
  i18n/           # Internationalization config
  lib/            # Utilities (MDX parser, SEO, Shiki)
```
