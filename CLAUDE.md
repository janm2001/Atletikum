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
