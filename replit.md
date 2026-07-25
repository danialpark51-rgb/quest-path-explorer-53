# EduPath

A personalized educational learning app that guides students through goal-based learning paths, quizzes, skills, stories, news, tasks, games, and an AI assistant.

## Run & Operate

- `pnpm --filter @workspace/eduapp run dev` — run the frontend (workflow managed)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS v3 + shadcn/ui
- Routing: react-router-dom v6
- State: React Context + localStorage (UserContext, LanguageContext)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/eduapp/` — React frontend
- `artifacts/eduapp/src/pages/` — All page components
- `artifacts/eduapp/src/components/` — Shared UI components (including shadcn `ui/`)
- `artifacts/eduapp/src/context/` — UserContext, LanguageContext
- `artifacts/eduapp/src/data/` — Static data (goals, skills, quizzes, games, etc.)
- `artifacts/eduapp/src/index.css` — Theme CSS variables (colors, fonts)
- `artifacts/eduapp/tailwind.config.ts` — Tailwind config with custom goal colors
- `artifacts/api-server/` — Express backend
- `lib/db/src/schema/` — Drizzle DB schema

## Architecture decisions

- App is currently frontend-only; all state is persisted via localStorage through UserContext
- No Supabase integration used — the imported `@supabase/supabase-js` dep and `src/integrations/supabase/` are unused stubs
- Fonts: Plus Jakarta Sans (body) + Space Grotesk (display), loaded via Google Fonts in index.html
- Tailwind v3 with postcss (not `@tailwindcss/vite`) — migrated from Lovable's vite plugin setup

## Product

- Login/onboarding with username, name, school, USN, class selection (Class 5–12)
- Goal selection (Engineering, Medical, Commerce, Arts, IT, Defence, Govt)
- Home dashboard with XP, level, streak
- Skills, quizzes, stories, news, tasks, games, AI assistant, observations
- Bottom nav: Home, Skills, Quiz, Videos, Discover, Profile
- Profile page with progress tracking

### AI Features
- **Discover Your Goal** (`/discover-goal`) — free-text input → AI returns top 4 career paths with roadmaps, personality profile, salary info, and "explore more" section
- **Think Like Great Minds** (`/thinking`) — explore famous thinkers' mindsets with TTS in 10 Indian languages; +25 XP per unique thinker
- **Scholarships** (`/scholarships`) — AI recommends real scholarships based on class, location, skills
- **Internships** (`/internships`) — AI recommends internship programs and platforms

### Other Features
- **Feedback** (`/feedback`) — star rating, category, message, bug report, feature request; stored in `uploads/feedback.json` (no DB required)

### Removed
- ~~Reels~~ — feature removed; all pages, components, data files, API routes, and DB schema deleted

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root — it has no dev script
- Tailwind v3 is used (not v4); the config is `tailwind.config.ts` with postcss
- `@supabase/supabase-js` is installed but unused — safe to remove if cleaning up deps
- AI features (discover-goal, scholarships, internships, thinking) require at least one AI key: `GROQ_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`, or the Replit AI integration (`AI_INTEGRATIONS_OPENAI_API_KEY`)
- Feedback is stored in `uploads/feedback.json` (file-based, no DB required)
- Class range is now 5–12 (updated from 6–10)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
