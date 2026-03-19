# Workout Completion UX — Design Spec

**Date:** 2026-03-19
**Goal:** Ship a faster, more reliable workout logging experience with one net-new feature (Repeat Last Workout) that increases completion rate and repeat usage.
**Target devices:** Mixed mobile + desktop (responsive, numeric-keyboard-first on mobile, tab-order-optimized on desktop).

---

## 1. Shared State Layer — `useWorkoutDraft`

### Problem

`useTrackWorkoutFlow` holds all workout session state in memory. Page refresh or navigation loses all progress. There is no mechanism to prefill from external sources (e.g., a previous workout log), and adding persistence means threading localStorage calls throughout the existing hook.

### Design

Replace `useTrackWorkoutFlow` with a new hook `useWorkoutDraft` that owns the full workout session lifecycle.

**Initialization sources (mutually exclusive, checked in order):**

1. **Restored draft** — existing draft in localStorage for this workoutId, younger than 24 hours
2. **Repeat-last prefill** — user explicitly chose "Repeat last session", data fetched from server
3. **Fresh start** — empty defaults from exercise definitions

**Persisted state shape:**

```typescript
// Reuses the existing CompletedExercisePayload from @/types/WorkoutLog/workoutLog
// (one entry per set, not per exercise — matches server-side WorkoutLog.completedExercises)
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

// Form values for a single set (what React Hook Form manages)
interface DraftSetValues {
  loadKg: number | null;
  resultValue: number;
  rpe: number;
}

interface WorkoutDraft {
  version: 1;
  workoutId: string;
  exerciseIndex: number;
  completedExercises: CompletedExercisePayload[];  // flat array, one entry per set
  currentSetValues: DraftSetValues[];               // form values for the active exercise's sets
  idempotencyKey: string;        // UUID, generated on draft creation
  submitting: boolean;           // true while submission in flight
  startedAt: string;             // ISO timestamp
  lastSavedAt: string;           // ISO timestamp
}
```

The `completedExercises` array reuses the existing `CompletedExercisePayload` type directly — no transformation needed on submission. `DraftSetValues` is a new type representing the form-level values for a single set before they are transformed into `CompletedExercisePayload` entries.

**Note:** `WorkoutLog.user` is `type: String` (not ObjectId) in the model. When querying by userId in the repeat-last endpoint, ensure the value is passed as a string.

**Note on `readinessScore` / `sessionFeedbackScore`:** The `WorkoutLog` model has these fields (default: 3), but they are not currently collected in the UI — the client never sends them and they always fall back to defaults. They are intentionally excluded from the draft shape. If a readiness/feedback UI is added later, the draft schema can be bumped to `version: 2` to include them.

**Storage:**

- Key: `atletikum_workout_draft_{workoutId}`
- Backend: `localStorage`
- TTL: 24 hours (checked on read; expired drafts are deleted and ignored)
- Auto-save triggers: set saved, exercise advanced
- Cleared on: successful submission, explicit discard

**Draft entry UX (on TrackWorkout mount):**

| State | UI |
|-------|----|
| Draft exists, `submitting: true` | "Your workout is being saved..." + retry button |
| Draft exists, `submitting: false` | "You have an in-progress workout. Resume or start fresh?" |
| No draft, latest log matches workout | "Start fresh" + "Repeat last session" |
| No draft, no matching log | Normal fresh start (no prompt) |

**What this replaces:**

- `useTrackWorkoutFlow`'s internal state management (exerciseIndex, completedExercises, form init)

**What changes in `useExerciseProgression`:**

`useExerciseProgression` currently owns `currentIndex` (via `useState`) and `completedExercises` (via `useState`). These two pieces of state move to `useWorkoutDraft` so they can be persisted. `useExerciseProgression` will receive them as parameters instead of managing them internally. Its pure utility functions (`createDefaultSets`, `getMetricFromPrescription`, `buildCompletedExerciseSets`) and derived values (`currentMetric`, `plannedSetCount`, `isLastExercise`, etc.) stay unchanged.

**What stays unchanged:**

- `useExerciseProgression`'s pure utility functions and metric detection
- `useWorkoutCompletion` (final submission + celebration navigation)
- React Hook Form as the form engine — `useWorkoutDraft` feeds it initial values and persists on change

---

## 2. Fast Set Entry UX

### Problem

Each set has 3 `NumberInput` fields that start empty with no carry-over. Every value must be typed from scratch. No keyboard flow optimization for mobile or desktop.

### Design

**Smart defaults (carry-over):**

- After saving Set N, Set N+1 auto-fills with Set N's values (loadKg, resultValue, rpe)
- User edits only what changed (typically reps decreasing or weight increasing)
- First set of an exercise uses: draft values (if resuming) > progression-prescribed values (if available) > empty

**Input optimizations:**

- Weight field: `inputMode="decimal"` (triggers decimal numeric keyboard on mobile)
- Reps and RPE fields: `inputMode="numeric"` (integer keyboard)
- Auto-focus the first empty field when a new set becomes active
- Tab order per set: loadKg -> resultValue -> rpe -> next set's loadKg
- On desktop: pressing Enter in the RPE field saves the set and moves focus to the next set's first field

**Quick actions:**

- "Copy previous" icon button on each set header (copies all 3 values from the set above)
- First set has no copy button (nothing to copy from)

**Visual states:**

- **Completed set:** collapsed to single-line summary, e.g., `85 kg . 8 reps . RPE 7`
- **Active set:** expanded with full input fields, visually prominent
- **Upcoming sets:** dimmed, shows planned count but no inputs until active

**Files modified:**

- `client/src/components/TrackWorkout/TrackWorkoutWorkoutCard.tsx` — input props, focus management, collapsed/expanded rendering, copy-previous logic
- `useWorkoutDraft` — carry-over logic when advancing sets

**No server changes.**

---

## 3. Rest Timer

### Problem

No rest timer exists. Users track rest manually or guess. The workout and exercise models have no rest duration field.

### Design

**Model change:**

Add `restSeconds` to `workoutExerciseSchema` in `server/models/Workout.js`:

```javascript
restSeconds: { type: Number, min: 0, max: 600, default: null }
```

When `null`, fallback to user preset or global default.

**Resolution order for timer duration:**

1. `exercise.restSeconds` from workout definition (set by admin or custom workout creator)
2. User's personal preset from localStorage (`atletikum_rest_timer_preset`)
3. Global default: 90 seconds

**Component: `RestTimer.tsx`**

- Floating compact pill/bar, fixed to bottom of viewport (above sticky save button)
- Displays: countdown, current preset label, pause button, dismiss button
- Auto-starts after each set save via `onSetSaved` callback
- Auto-dismisses when countdown reaches 0
- On completion: `navigator.vibrate(200)` if available (no-op on desktop)
- Hidden during final submission (no rest after last set of last exercise)
- Keeps running when tab is hidden (uses absolute timestamp — see hook design below)

**Presets:**

- Default options: 60s, 90s, 120s
- Shown as a small toggle group inside the timer pill (tap to cycle)
- Selected preset persisted to `atletikum_rest_timer_preset` in localStorage

**Hook: `useRestTimer`**

- API: `start(seconds)`, `pause()`, `resume()`, `reset()`, `remaining` (number), `isRunning` (boolean)
- Uses an **absolute target timestamp** approach: `endTime = Date.now() + seconds * 1000`. A `setInterval` (1s tick) recalculates `remaining = Math.max(0, endTime - Date.now())` each tick. This means the timer stays accurate even when the tab is hidden (phone locked in the gym) — on return, it shows the real remaining time or that rest has elapsed.
- Uses `useRef` for interval and `endTime` to avoid parent re-renders
- Only the timer pill component subscribes to tick updates

**Admin/custom workout form impact:**

- One new optional `NumberInput` per exercise row: "Odmor (sekunde)" / "Rest (seconds)"
- Existing workouts get `null` (timer falls back to user preset or 90s)

**Client type updates:**

- Add `restSeconds?: number` to `WorkoutExercise` type

**Files created:**

- `client/src/components/TrackWorkout/RestTimer.tsx`
- `client/src/hooks/useRestTimer.ts`

**Files modified:**

- `server/models/Workout.js` — add `restSeconds` to `workoutExerciseSchema`
- `server/validators/workoutValidator.js` — validate `restSeconds` (optional, 0-600)
- `client/src/types/Workout/workout.ts` — add `restSeconds` to type
- `client/src/components/TrackWorkout/TrackWorkoutWorkoutCard.tsx` — mount timer, wire `onSetSaved`
- `client/src/i18n/locales/hr.json` — timer labels and preset names

---

## 4. Repeat Last Workout

### Problem

Users who repeat the same workouts weekly must re-enter all values from scratch. No way to start from where they left off last time.

### Design

**Backend:**

New endpoint: `GET /api/v1/workout-logs/latest/:workoutId`

- Auth: `protect` middleware (logged-in user)
- Validation: `workoutId` must be valid ObjectId
- Service: `WorkoutLog.findOne({ user: userId, workoutId }).sort({ date: -1 }).lean()`
- Returns: the full log document, or `null` (204 No Content) if no previous log exists

**Frontend:**

New hook: `useLatestWorkoutLog(workoutId: string)`

- TanStack Query wrapper for the endpoint
- `staleTime: 5 * 60 * 1000` (same as gamification — this data changes infrequently)
- `enabled: !!workoutId && !draftExists` (don't fetch if a draft is already present)

**Strict match gate:**

Before offering "Repeat last session", compare exercise IDs using the existing `getExerciseId()` helper (handles both populated objects and raw string IDs):

```typescript
const workoutExerciseIds = workout.exercises.map(e => getExerciseId(e.exerciseId)).sort();
const logExerciseIds = [...new Set(latestLog.completedExercises.map(e => e.exerciseId))].sort();
const isExactMatch = workoutExerciseIds.length === logExerciseIds.length
  && workoutExerciseIds.every((id, i) => id === logExerciseIds[i]);
```

If not an exact match (admin changed the workout since last completion), don't offer the option.

**Prefill mapping:**

Map the log's `completedExercises` back to draft format:

- Group log exercises by `exerciseId`
- For each exercise in workout order, take the corresponding log sets
- Map each set to `{ loadKg, resultValue, rpe }` form values
- Feed into `useWorkoutDraft` as initial state

**Entry point UI:**

- On `TrackWorkoutPageContent` mount, after draft check fails, if `useLatestWorkoutLog` returns data and strict match passes:
  - Show two buttons: "Start fresh" and "Repeat last session"
- CTA also available on `WorkoutLogCard` in Training Logs: "Repeat this workout" link/button that navigates to `/zapis-treninga/{workoutId}?prefill=last`

**Files created:**

- New service method in `server/services/workoutLogService.js`
- New controller method in `server/controllers/workoutLogController.js`

**Query key:** Add `latest: (workoutId: string) => [...keys.workoutLogs.all, 'latest', workoutId]` to `client/src/lib/query-keys.ts`.

**Cache invalidation:** The `useCreateWorkoutLog` mutation's `onSuccess` must invalidate the latest-log query for the submitted workoutId, so the next visit to the same workout shows the freshly completed log as the "Repeat last session" source:

```typescript
queryClient.invalidateQueries({ queryKey: keys.workoutLogs.latest(workoutId) });
```

**Files modified:**

- `server/routes/workoutLogRoutes.js` — add GET route
- `server/validators/workoutLogValidator.js` — validate workoutId param
- `client/src/api/workoutLogs.ts` — new fetch function
- `client/src/hooks/useWorkoutLogs.ts` — new `useLatestWorkoutLog` hook, add invalidation to `useCreateWorkoutLog`
- `client/src/lib/query-keys.ts` — add `latest` key factory
- `client/src/pages/TrackWorkout/TrackWorkout.tsx` — entry decision UI
- `client/src/components/WorkoutLogs/WorkoutLogCard.tsx` — "Repeat" CTA

---

## 5. Analytics Events

### Problem

No client-side event tracking. The existing `analyticsService` is admin-focused KPI aggregation, not user event ingestion.

### Design

**Model: `AnalyticsEvent`**

```javascript
{
  userId:    { type: ObjectId, ref: "User", required: true },
  event:     { type: String, required: true, maxlength: 100 },
  payload:   { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
}
```

- TTL index on `createdAt`: 90 days (automatic MongoDB cleanup)
- Compound index on `{ event, createdAt }` for querying

**Endpoint: `POST /api/v1/analytics-events`**

- Mounted via a **new** route file `server/routes/analyticsEventRoutes.js` (separate from the admin-only `analyticsRoutes.js` which applies `restrictTo("admin")` globally)
- Auth: `protect` middleware only (any authenticated user can send events)
- Rate limiter: 60 requests per minute per user (prevents runaway client loops)
- Validation: `event` is required non-empty string (max 100 chars), `payload` is optional object
- Controller: extract userId from request, delegate to service
- Service: `AnalyticsEvent.create({ userId, event, payload })`

**Tracked events:**

| Event | Trigger | Payload |
|-------|---------|---------|
| `workout_started` | Draft created (fresh or repeat) | `{ workoutId, source: "fresh" \| "repeat" }` |
| `workout_resumed` | Draft restored from localStorage | `{ workoutId, draftAgeMs }` |
| `workout_draft_discarded` | User explicitly discards draft | `{ workoutId }` |
| `workout_set_saved` | Each set confirmed | `{ workoutId, exerciseIndex, setIndex }` |
| `workout_completed` | Successful submission | `{ workoutId, totalSets, durationMs }` |
| `workout_abandoned` | `beforeunload` with unsaved draft | `{ workoutId, exerciseIndex }` |

**Client hook: `useTrackEvent`**

```typescript
const trackEvent = useTrackEvent();
trackEvent("workout_started", { workoutId, source: "fresh" });
```

- Fire-and-forget: `apiClient.post(...)` with `.catch(() => {})` — never blocks UI
- No retry, no queuing — if it fails, it fails silently

**Special case: `workout_abandoned`**

The `beforeunload` event does not reliably deliver `fetch`/`XMLHttpRequest` calls. This event uses `navigator.sendBeacon()` instead:

```typescript
navigator.sendBeacon(
  `${API_BASE_URL}/analytics-events`,
  new Blob([JSON.stringify({ event: "workout_abandoned", payload })], { type: "application/json" })
);
```

The analytics endpoint must accept `application/json` content type from `sendBeacon` (Express's `express.json()` middleware handles this natively). The `sendBeacon` call does not include the `Authorization` header, so the `workout_abandoned` event needs special handling:

- Add a dedicated sub-route: `POST /api/v1/analytics-events/abandoned` — **no** `protect` middleware on this single route
- This route only accepts `{ event: "workout_abandoned", draftId: string, payload: object }` — the `draftId` (idempotency key) correlates to the user's draft; the event is low-stakes and doesn't need auth
- The main `POST /api/v1/analytics-events` route keeps `protect` middleware for all other events
- Rate limiting on the unauthenticated route is IP-based (same 60 req/min) since there is no userId available

**Files created:**

- `server/models/AnalyticsEvent.js`
- `server/validators/analyticsValidator.js`
- `server/controllers/analyticsEventController.js`
- `server/routes/analyticsEventRoutes.js` — new file (separate from admin-only `analyticsRoutes.js`)
- `client/src/hooks/useTrackEvent.ts`

**Files modified:**

- `server/index.js` — mount new `analyticsEventRoutes` at `/api/v1/analytics-events`
- `server/middleware/rateLimiters.js` — add `analyticsEventLimiter` (60 req/min)
- `client/src/i18n/locales/hr.json` — no user-facing strings for analytics

---

## 6. Submission Reliability

### Problem

Current duplicate protection is a 60-second time-window check on the server. No idempotency tokens. Client has minimal double-submit guards (just `isSubmitting` flag on the mutation). Network failures can lose in-flight data.

### Design

**Idempotency key:**

- Generated as `crypto.randomUUID()` when a draft is created
- Stored in the draft (persists across page reloads)
- Sent as `X-Idempotency-Key` header on workout log submission
- Server checks before creating: `WorkoutLog.findOne({ idempotencyKey, user: userId })`
  - If found: return existing result (200, not 201) — safe retry
  - If not found: proceed with normal creation

**WorkoutLog model change:**

```javascript
idempotencyKey: { type: String, unique: true, sparse: true }
```

**Note:** No `default` is set — when the field is absent from a document, MongoDB's sparse index ignores it, so existing logs and logs created without a key will not conflict. If `default: null` were used, Mongoose would write `null` explicitly, and two such documents would collide on the unique index.

The existing 60-second time-window dedup stays as a secondary guard for clients that don't send the header.

**UI guards:**

- Submit button disabled while mutation is `isPending` (already exists)
- Draft `submitting` flag set to `true` before mutation fires, cleared on success/error
- If page reloads with `submitting: true`: show "Your workout is being saved..." message with a retry button instead of the form

**Error feedback (all via i18n):**

| Server response | i18n key | Croatian message |
|----------------|----------|-----------------|
| 409 (duplicate) | `workout.errors.alreadySaved` | "Ovaj trening je vec spremljen." |
| 400 (validation) | `workout.errors.validationFailed` | "Podaci treninga nisu ispravni. Provjerite unesene vrijednosti." |
| 5xx | `workout.errors.serverError` | "Greska na serveru. Vas napredak je spremljen lokalno - pokusajte ponovo." |
| Network error | `workout.errors.networkError` | "Problem s vezom. Vas napredak je spremljen lokalno - pokusajte ponovo." |

**409 special handling:** If the server returns 409 with the existing log data, navigate to the celebration page with that data (the workout was already saved successfully).

**Files modified:**

- `server/models/WorkoutLog.js` — add `idempotencyKey` field
- `server/services/workoutLogService.js` — check idempotency key before creation
- `client/src/hooks/useWorkoutCompletion.ts` — send header, handle error mapping
- `client/src/hooks/useWorkoutDraft.ts` — store/manage `submitting` flag
- `client/src/api/workoutLogs.ts` — pass idempotency header
- `client/src/i18n/locales/hr.json` — error message keys

---

## Implementation Order

| Phase | Days | What ships |
|-------|------|-----------|
| 1 | 1-2 | `useWorkoutDraft` hook + storage read/write + draft resume prompt UI. Refactor `useExerciseProgression` state ownership. Analytics endpoint + model + `useTrackEvent` hook. At this point: draft is created and can be restored on reload, but auto-save on every set change is not yet wired. |
| 2 | 2-3 | Fast set entry (carry-over defaults, input optimization, collapsed/active/upcoming set states, copy-previous action) |
| 3 | 3-4 | Rest timer (`restSeconds` model field + `RestTimer` component + `useRestTimer` hook + preset persistence + workout form field) |
| 4 | 4-5 | Wire auto-save triggers (debounced save on set completion + exercise advance), 24h TTL expiry cleanup, explicit "Discard draft" button + confirmation. This completes the draft lifecycle end-to-end. |
| 5 | 6-7 | Repeat Last Workout (server endpoint + `useLatestWorkoutLog` hook + strict match + prefill mapping + CTA in TrackWorkout and WorkoutLogCard) |
| 6 | 7-8 | Submission reliability (idempotency key on model + server check + `X-Idempotency-Key` header + error mapping + i18n Croatian error messages) |
| 7 | 8-9 | Tests (client + server for all new behavior) |
| 8 | 10 | QA gates, regression pass, release prep |

---

## Scope Guardrails

- Follow existing architecture: API modules + hooks on client; routes + controllers + services on server
- All user-facing text through i18n (`hr.json`)
- No unrelated refactoring — stay focused on workout completion flow
- Each phase is independently shippable and testable
- Preserve all existing XP/achievement/streak side effects
