# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atletikum is a gamified fitness training application (MERN stack) with XP/level progression, streaks, badges, workout logging (S&C Log), a Knowledge Base with quizzes, and an Admin Panel.

## Commands

### Development

```bash
npm start              # Run server + client concurrently
npm run server         # Server only (node --watch, port 5001)
npm run client         # Client only (Vite dev server, port 5173)
```

### Testing

```bash
cd server && npm test                        # Run all server tests (Jest)
cd server && npm test -- --testPathPattern=articleService  # Run single server test file
cd client && npm test                        # Run all client tests (Vitest)
```

### Build & Lint

```bash
cd client && npm run build    # TypeScript check + Vite production build
cd client && npm run lint     # ESLint
```

### Database Seeding

```bash
cd server && npm run seed:exercises    # Seed exercises (--delete to clear first)
cd server && npm run seed:workouts
cd server && npm run seed:articles
cd server && npm run seed:achievements
```

## Architecture

### Stack

- **Frontend**: React 19 + TypeScript, Vite, Mantine UI v8, TanStack Query v5, React Hook Form + Zod, Tiptap (rich text), i18next
- **Backend**: Node.js/Express 5, MongoDB/Mongoose, JWT auth
- **File storage**: Local `/uploads` or Cloudinary (configured via `ARTICLE_IMAGE_STORAGE` env var)

### Server (`server/`)

Layered architecture: **Routes → Controllers → Services → Models**

- `index.js` — Express app, middleware stack, routes mounted at `/api/v1/`
- `config/env.js` — All env vars with validation; required: `JWT_SECRET`, `MONGO_URI`
- `routes/` — 9 route files (auth, articles, exercises, workouts, workoutLogs, quiz, achievements, leaderboard, recommendations)
- `controllers/` — Thin handlers that delegate to services
- `services/` — Business logic (authService, articleService, workoutLogService, quizService, recommendationService, progressionService, userProgressService, etc.)
- `models/` — Mongoose schemas (User, Article, ArticleBookmark, Exercise, ExerciseProgression, Workout, WorkoutLog, QuizCompletion, Achievement)
- `middleware/` — authMiddleware (JWT + RBAC), rateLimiters, errorHandler, sanitizeMongo, upload (Multer), validate
- `validators/` — Joi/express-validator schemas for request validation
- `utils/` — AppError, cloudinaryUploads, uploadCleanup

### Client (`client/src/`)

- `routes.tsx` — React Router v7 with lazy-loaded pages; Croatian URL slugs (`/pregled`, `/profil`, `/edukacija`, `/zapis-treninga`, `/upravljanje`, `/ljestvica`, `/slavlje`)
- `context/UserContext.tsx` — Global auth state (user, token, loading); persisted to localStorage
- `api/` — 10 typed API modules (one per domain); all go through `utils/apiService.ts` (Axios with JWT interceptor)
- `hooks/` — 17 custom hooks (useAuth, useUser, useArticle, useQuiz, useWorkout, useWorkoutLogs, useExercise, useAchievements, etc.)
- `pages/` — 15 page directories (Dashboard, Profile, TrainingLogs, TrackWorkout, KnowledgeBase, AdminPanel, Leaderboard, auth pages)
- `components/` — Shared and domain-specific components
- `types/` — TypeScript type definitions per domain
- `schema/` — Zod form validation schemas
- `i18n/locales/` — Croatian language strings

### Key Patterns

- **TanStack Query**: all server state; default `staleTime: 30s` in `App.tsx`
- **Protected routes**: `ProtectedRoute` component with role checks
- **Article images**: conditionally stored locally or in Cloudinary based on `ARTICLE_IMAGE_STORAGE` env var; the `cloudinaryUploads.js` util handles the Cloudinary path
- **Rate limiting**: separate limiters for auth, article mutations, and user mutations in `middleware/rateLimiters.js`
- **Gamification**: XP/level/streaks live on the `User` model; achievements are checked/unlocked in `achievementService.js` after workout logs, quiz completions, etc.

## Best Practices

### Backend

- **MVC structure**: All backend tasks must follow the layered architecture — Routes → Controllers → Services → Models. Controllers stay thin (parse request, call service, send response). Business logic lives exclusively in services.
- **Error handling**: Always use the `AppError` class from `utils/` for operational errors. Never throw raw `Error` objects in services or controllers. Let the centralized `errorHandler` middleware handle formatting.
- **Validation first**: Every route that accepts user input must have a corresponding validator in `validators/`. Validation middleware runs before the controller — never validate inside controllers or services.
- **Mongoose best practices**: Define indexes in schemas, not at query time. Use `.lean()` for read-only queries where you don't need Mongoose document methods. Always handle `CastError` and `ValidationError` in the error handler.
- **Keep routes clean**: Route files should only contain route definitions and middleware chaining. No inline logic.
- **Environment variables**: All new env vars must be registered and validated in `config/env.js`. Never use `process.env` directly outside that file.

### Frontend

- **TypeScript compliance**: After implementing every feature, run `npm run build` and `npm run lint` in the client directory. Fix all TypeScript errors and lint warnings before considering the task complete.
- **One component per file**: Each component that returns JSX must live in its own file. Never export two rendering components from the same file. Utility functions and hooks that support a component may coexist only if they are private to that component.
- **React Hook Form + Zod for all forms**: Always use React Hook Form for form state management. Pair it with the corresponding Zod schema from `schema/` for validation. Never use uncontrolled forms or manual `useState`-based form handling.
- **TanStack Query for all server state**: Never store API responses in local component state or context. Use the existing hooks in `hooks/` that wrap TanStack Query. If a new endpoint is needed, create a new hook following the established pattern.
- **API modules**: All API calls go through the typed modules in `api/` via `apiService.ts`. Never call Axios directly from components or hooks.
- **Mantine UI components**: Use Mantine v8 components as the building blocks for all UI. Avoid writing custom CSS for things Mantine already provides (spacing, typography, layout, modals, notifications).
- **Translations**: All user-facing strings must go through i18next. Add new keys to `i18n/locales/` — never hardcode Croatian or English strings in components.
- **Lazy loading**: New pages must be lazy-loaded in `routes.tsx` using `React.lazy()` to keep the initial bundle size small.
- **Types in `types/`**: All shared TypeScript interfaces and types live in the `types/` directory, organized by domain. Don't define inline types for data structures that are used across multiple files.

### General

- **No dead code**: Remove unused imports, variables, and commented-out code before finishing a task.
- **Consistent naming**: Use camelCase for variables/functions, PascalCase for components/classes, and kebab-case for file names on the client. Match existing conventions in the codebase.
- **Test coverage**: New services on the backend should include corresponding Jest tests. Follow the existing test patterns in the `server/` test files.
- **Commit-ready code**: Every change should leave the app in a working state. Run both server tests and client build before considering work done.
- **Context 7**: Always use Context7 when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
