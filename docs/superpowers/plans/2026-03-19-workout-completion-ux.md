# Workout Completion UX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a faster, more reliable workout logging experience with draft persistence, fast set entry, rest timer, repeat-last-workout, analytics, and submission reliability.

**Architecture:** New `useWorkoutDraft` hook replaces `useTrackWorkoutFlow` as the session state owner, persisting to localStorage. `useExerciseProgression` becomes stateless (receives state as params). Server gets new analytics event ingestion, repeat-last endpoint, and idempotency key support.

**Tech Stack:** React 19, TypeScript, Mantine UI v8, TanStack Query v5, React Hook Form, Zod, i18next, Node.js/Express 5, MongoDB/Mongoose

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `client/src/hooks/useWorkoutDraft.ts` | Owns workout session lifecycle: init from draft/repeat/fresh, persist to localStorage, auto-save, TTL cleanup |
| `client/src/hooks/useRestTimer.ts` | Absolute-timestamp rest timer with start/pause/resume/reset API |
| `client/src/hooks/useTrackEvent.ts` | Fire-and-forget analytics event hook |
| ~~`client/src/hooks/useLatestWorkoutLog.ts`~~ | *(Not a separate file — `useLatestWorkoutLog` lives in `client/src/hooks/useWorkoutLogs.ts`)* |
| `client/src/components/TrackWorkout/RestTimer.tsx` | Floating rest timer pill UI |
| `client/src/components/TrackWorkout/DraftPrompt.tsx` | Resume/discard/repeat-last decision UI on TrackWorkout mount |
| `client/src/utils/workoutDraftStorage.ts` | localStorage read/write/clear/TTL for workout drafts |
| `client/src/types/Workout/workoutDraft.ts` | `WorkoutDraft` and `DraftSetValues` type definitions |
| `server/models/AnalyticsEvent.js` | Mongoose model with TTL index (90 days) |
| `server/routes/analyticsEventRoutes.js` | POST /api/v1/analytics-events (auth + unauthenticated abandoned sub-route) |
| `server/controllers/analyticsEventController.js` | Thin handler delegating to service |
| `server/services/analyticsEventService.js` | AnalyticsEvent.create |
| `server/validators/analyticsEventValidator.js` | Validate event name + optional payload |

### Modified files

| File | Change |
|------|--------|
| `client/src/hooks/useExerciseProgression.ts` | Remove `currentIndex` and `completedExercises` state; receive as params |
| `client/src/hooks/useTrackWorkoutFlow.ts` | Replace with thin wrapper around `useWorkoutDraft` + `useExerciseProgression` |
| `client/src/hooks/useWorkoutCompletion.ts` | Accept idempotency key, send `X-Idempotency-Key` header, error mapping |
| `client/src/hooks/useWorkoutLogs.ts` | Add `useLatestWorkoutLog`, add latest-log invalidation to `useCreateWorkoutLog` |
| `client/src/api/workoutLogs.ts` | Add `getLatestWorkoutLog`, update `createWorkoutLog` to accept idempotency key |
| `client/src/lib/query-keys.ts` | Add `workoutLogs.latest(workoutId)` |
| `client/src/types/Workout/workout.ts` | Add `restSeconds?: number` to `WorkoutExercise` |
| `client/src/types/WorkoutLog/workoutLog.ts` | Add `idempotencyKey` to `WorkoutLogPayload` (optional) |
| `client/src/components/TrackWorkout/TrackWorkoutWorkoutCard.tsx` | Collapsed/active/upcoming set states, carry-over, copy-previous, inputMode, focus management |
| `client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx` | Mount DraftPrompt, RestTimer; wire useWorkoutDraft |
| `client/src/components/WorkoutLogs/WorkoutLogCard.tsx` | "Repeat this workout" CTA |
| `client/src/pages/TrackWorkout/TrackWorkout.tsx` | Entry decision UI (draft/repeat/fresh) |
| `client/src/i18n/locales/hr.json` | All new user-facing strings |
| `server/models/Workout.js` | Add `restSeconds` to `workoutExerciseSchema` |
| `server/validators/workoutValidator.js` | Validate optional `restSeconds` (0–600) on workout create/update |
| `server/models/WorkoutLog.js` | Add `idempotencyKey` field with sparse unique index |
| `server/services/workoutLogService.js` | Add `getLatestWorkoutLog`, add idempotency check to `createWorkoutLog` |
| `server/controllers/workoutLogController.js` | Add `getLatestWorkoutLog` handler |
| `server/routes/workoutLogRoutes.js` | Add GET `/latest/:workoutId` route |
| `server/validators/workoutLogValidator.js` | Add `validateGetLatestWorkoutLogRequest` |
| `server/middleware/rateLimiters.js` | Add `analyticsEventLimiter` |
| `server/index.js` | Mount `analyticsEventRoutes` |

---

## Phase 1: useWorkoutDraft + Storage + Analytics Endpoint (Days 1–2)

### Task 1.1: Draft type definitions

**Files:**
- Create: `client/src/types/Workout/workoutDraft.ts`

- [ ] **Step 1: Create the draft types file**

```typescript
// client/src/types/Workout/workoutDraft.ts
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

// Note: DraftSetValues is structurally identical to TrackWorkoutSetFormValues
// from @/types/Workout/trackWorkout. No mapping needed between them.
export interface DraftSetValues {
  loadKg: number | null;
  resultValue: number;
  rpe: number;
}

export interface WorkoutDraft {
  version: 1;
  workoutId: string;
  exerciseIndex: number;
  completedExercises: CompletedExercisePayload[];
  currentSetValues: DraftSetValues[];
  idempotencyKey: string;
  submitting: boolean;
  startedAt: string;
  lastSavedAt: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors related to workoutDraft.ts

- [ ] **Step 3: Commit**

```bash
git add client/src/types/Workout/workoutDraft.ts
git commit -m "feat: add WorkoutDraft type definitions"
```

---

### Task 1.2: Draft localStorage utilities

**Files:**
- Create: `client/src/utils/workoutDraftStorage.ts`
- Test: `client/src/__tests__/workoutDraftStorage.test.ts`

- [ ] **Step 1: Write failing tests for draft storage**

```typescript
// client/src/__tests__/workoutDraftStorage.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkoutDraft } from "@/types/Workout/workoutDraft";
import {
  getDraft,
  saveDraft,
  clearDraft,
  getDraftKey,
} from "@/utils/workoutDraftStorage";

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const createTestDraft = (overrides?: Partial<WorkoutDraft>): WorkoutDraft => ({
  version: 1,
  workoutId: "w1",
  exerciseIndex: 0,
  completedExercises: [],
  currentSetValues: [{ loadKg: 50, resultValue: 8, rpe: 7 }],
  idempotencyKey: "test-uuid",
  submitting: false,
  startedAt: new Date().toISOString(),
  lastSavedAt: new Date().toISOString(),
  ...overrides,
});

describe("workoutDraftStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getDraftKey returns namespaced key", () => {
    expect(getDraftKey("w1")).toBe("atletikum_workout_draft_w1");
  });

  it("saveDraft writes to localStorage and getDraft reads it back", () => {
    const draft = createTestDraft();
    saveDraft(draft);
    expect(getDraft("w1")).toEqual(draft);
  });

  it("getDraft returns null when no draft exists", () => {
    expect(getDraft("nonexistent")).toBeNull();
  });

  it("getDraft returns null and removes expired draft", () => {
    const expired = createTestDraft({
      lastSavedAt: new Date(Date.now() - DRAFT_TTL_MS - 1000).toISOString(),
    });
    localStorage.setItem(getDraftKey("w1"), JSON.stringify(expired));
    expect(getDraft("w1")).toBeNull();
    expect(localStorage.getItem(getDraftKey("w1"))).toBeNull();
  });

  it("clearDraft removes the draft", () => {
    saveDraft(createTestDraft());
    clearDraft("w1");
    expect(getDraft("w1")).toBeNull();
  });

  it("getDraft returns null on corrupted JSON", () => {
    localStorage.setItem(getDraftKey("w1"), "not-json");
    expect(getDraft("w1")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/__tests__/workoutDraftStorage.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found

- [ ] **Step 3: Implement draft storage utilities**

```typescript
// client/src/utils/workoutDraftStorage.ts
import type { WorkoutDraft } from "@/types/Workout/workoutDraft";

const DRAFT_KEY_PREFIX = "atletikum_workout_draft_";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const getDraftKey = (workoutId: string): string =>
  `${DRAFT_KEY_PREFIX}${workoutId}`;

export const getDraft = (workoutId: string): WorkoutDraft | null => {
  try {
    const raw = localStorage.getItem(getDraftKey(workoutId));
    if (!raw) return null;

    const draft = JSON.parse(raw) as WorkoutDraft;
    const age = Date.now() - new Date(draft.lastSavedAt).getTime();

    if (age > DRAFT_TTL_MS) {
      localStorage.removeItem(getDraftKey(workoutId));
      return null;
    }

    return draft;
  } catch {
    localStorage.removeItem(getDraftKey(workoutId));
    return null;
  }
};

export const saveDraft = (draft: WorkoutDraft): void => {
  try {
    localStorage.setItem(getDraftKey(draft.workoutId), JSON.stringify(draft));
  } catch {
    // Ignore storage failures — draft is best-effort
  }
};

export const clearDraft = (workoutId: string): void => {
  try {
    localStorage.removeItem(getDraftKey(workoutId));
  } catch {
    // Ignore
  }
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/__tests__/workoutDraftStorage.test.ts 2>&1 | tail -20`
Expected: all 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/workoutDraftStorage.ts client/src/__tests__/workoutDraftStorage.test.ts
git commit -m "feat: add workout draft localStorage utilities with TTL"
```

---

### Task 1.3: Refactor useExerciseProgression to receive state as params

**Files:**
- Modify: `client/src/hooks/useExerciseProgression.ts`
- Modify: `client/src/hooks/useTrackWorkoutFlow.ts`

- [ ] **Step 1: Update useExerciseProgression to accept external state**

Replace the `useState` calls in `useExerciseProgression` with params. The hook should accept `currentIndex`, `completedExercises`, `setCurrentIndex`, and `setCompletedExercises` from the caller.

Change the `UseExerciseProgressionParams` type:

```typescript
type UseExerciseProgressionParams = {
  control: Control<TrackWorkoutFormValues>;
  reset: UseFormReset<TrackWorkoutFormValues>;
  workout: Workout;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  completedExercises: CompletedExercisePayload[];
  setCompletedExercises: React.Dispatch<React.SetStateAction<CompletedExercisePayload[]>>;
};
```

Remove the two `useState` lines and use the params instead:

```typescript
export const useExerciseProgression = ({
  control,
  reset,
  workout,
  currentIndex,
  setCurrentIndex,
  completedExercises,
  setCompletedExercises,
}: UseExerciseProgressionParams) => {
  // Remove: const [currentIndex, setCurrentIndex] = useState(0);
  // Remove: const [completedExercises, setCompletedExercises] = useState<...>([]);

  // Everything else stays the same — currentExercise, currentMetric,
  // plannedSetCount, etc. all derive from currentIndex and workout

  const currentExercise = workout.exercises[currentIndex];
  // ... rest unchanged ...
};
```

- [ ] **Step 2: Update useTrackWorkoutFlow to own the state temporarily**

In `useTrackWorkoutFlow`, add the state that was removed from `useExerciseProgression`:

```typescript
import { useState } from "react";
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

export const useTrackWorkoutFlow = ({ workout }: UseTrackWorkoutFlowParams) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercisePayload[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TrackWorkoutFormValues>({
    defaultValues: {
      sets: createDefaultSets(
        workout.exercises[0]?.sets ?? 1,
        workout.exercises[0]?.progression?.prescribedLoadKg ??
          workout.exercises[0]?.progression?.initialWeightKg ??
          null,
      ),
    },
  });

  const { fields: setFields } = useFieldArray({ control, name: "sets" });
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const {
    advanceToNextExercise,
    completedExerciseCount,
    currentExercise,
    currentMetric,
    getUpdatedCompletedExercises,
    isLastExercise,
    plannedSetCount,
    progressValue,
    totalExercises,
    watchedSets,
  } = useExerciseProgression({
    control,
    reset,
    workout,
    currentIndex,
    setCurrentIndex,
    completedExercises,
    setCompletedExercises,
  });

  // ... rest unchanged ...
};
```

- [ ] **Step 3: Run existing tests + build to verify no regressions**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useExerciseProgression.ts client/src/hooks/useTrackWorkoutFlow.ts
git commit -m "refactor: extract state from useExerciseProgression into caller"
```

---

### Task 1.4: Create useWorkoutDraft hook

**Files:**
- Create: `client/src/hooks/useWorkoutDraft.ts`

- [ ] **Step 1: Create the useWorkoutDraft hook**

```typescript
// client/src/hooks/useWorkoutDraft.ts
import { useCallback, useState } from "react";
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";
import type { DraftSetValues, WorkoutDraft } from "@/types/Workout/workoutDraft";
import type { Workout } from "@/types/Workout/workout";
import { clearDraft, getDraft, saveDraft } from "@/utils/workoutDraftStorage";
import { createDefaultSets } from "@/hooks/useExerciseProgression";

type DraftSource = "fresh" | "restored" | "repeat";

type InitFromRepeatParams = {
  completedExercises: CompletedExercisePayload[];
  setValuesByExercise: Map<string, DraftSetValues[]>;
};

type UseWorkoutDraftParams = {
  workout: Workout;
};

const buildFreshDraft = (workout: Workout): WorkoutDraft => {
  const firstExercise = workout.exercises[0];
  const prescribedLoadKg =
    firstExercise?.progression?.prescribedLoadKg ??
    firstExercise?.progression?.initialWeightKg ??
    null;
  const setCount = Math.max(1, Number(firstExercise?.sets ?? 1));

  return {
    version: 1,
    workoutId: workout._id,
    exerciseIndex: 0,
    completedExercises: [],
    currentSetValues: createDefaultSets(setCount, prescribedLoadKg),
    idempotencyKey: crypto.randomUUID(),
    submitting: false,
    startedAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
  };
};

export const useWorkoutDraft = ({ workout }: UseWorkoutDraftParams) => {
  // Use useState with lazy initializer (not useRef) so the draft is read once
  // and stays stable even if workout._id changes across re-renders.
  const [existingDraft] = useState(() => getDraft(workout._id));

  const [draftSource, setDraftSource] = useState<DraftSource | null>(
    existingDraft ? "restored" : null,
  );
  const [currentIndex, setCurrentIndex] = useState(
    existingDraft?.exerciseIndex ?? 0,
  );
  const [completedExercises, setCompletedExercises] = useState<
    CompletedExercisePayload[]
  >(existingDraft?.completedExercises ?? []);
  const [idempotencyKey] = useState(
    () => existingDraft?.idempotencyKey ?? crypto.randomUUID(),
  );
  const [submitting, setSubmitting] = useState(
    existingDraft?.submitting ?? false,
  );
  const [startedAt] = useState(
    () => existingDraft?.startedAt ?? new Date().toISOString(),
  );
  const [initialSetValues] = useState<DraftSetValues[]>(
    () => existingDraft?.currentSetValues ?? [],
  );

  const hasDraft = existingDraft !== null;
  const isSubmittingFromDraft = hasDraft && existingDraft.submitting;

  const persistDraft = useCallback(
    (
      exerciseIndex: number,
      completed: CompletedExercisePayload[],
      currentSets: DraftSetValues[],
      isSubmitting = false,
    ) => {
      const draft: WorkoutDraft = {
        version: 1,
        workoutId: workout._id,
        exerciseIndex,
        completedExercises: completed,
        currentSetValues: currentSets,
        idempotencyKey,
        submitting: isSubmitting,
        startedAt,
        lastSavedAt: new Date().toISOString(),
      };
      saveDraft(draft);
    },
    [workout._id, idempotencyKey, startedAt],
  );

  const startFresh = useCallback(() => {
    const fresh = buildFreshDraft(workout);
    setCurrentIndex(0);
    setCompletedExercises([]);
    setDraftSource("fresh");
    saveDraft(fresh);
  }, [workout]);

  const startFromRepeat = useCallback(
    ({ completedExercises: prefill, setValuesByExercise }: InitFromRepeatParams) => {
      setCurrentIndex(0);
      setCompletedExercises([]);
      setDraftSource("repeat");
      const firstExerciseId =
        typeof workout.exercises[0]?.exerciseId === "object"
          ? workout.exercises[0].exerciseId._id
          : (workout.exercises[0]?.exerciseId ?? "");
      const firstSets = setValuesByExercise.get(firstExerciseId) ?? [];
      const draft: WorkoutDraft = {
        version: 1,
        workoutId: workout._id,
        exerciseIndex: 0,
        completedExercises: [],
        currentSetValues:
          firstSets.length > 0
            ? firstSets
            : createDefaultSets(
                workout.exercises[0]?.sets ?? 1,
                workout.exercises[0]?.progression?.prescribedLoadKg ?? null,
              ),
        idempotencyKey: crypto.randomUUID(),
        submitting: false,
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
      };
      saveDraft(draft);
    },
    [workout],
  );

  const resumeDraft = useCallback(() => {
    setDraftSource("restored");
  }, []);

  const discardDraft = useCallback(() => {
    clearDraft(workout._id);
    setDraftSource(null);
    setCurrentIndex(0);
    setCompletedExercises([]);
  }, [workout._id]);

  const clearOnSuccess = useCallback(() => {
    clearDraft(workout._id);
  }, [workout._id]);

  const markSubmitting = useCallback(
    (isSubmitting: boolean) => {
      setSubmitting(isSubmitting);
    },
    [],
  );

  return {
    // State
    currentIndex,
    setCurrentIndex,
    completedExercises,
    setCompletedExercises,
    idempotencyKey,
    submitting,
    startedAt,
    draftSource,
    initialSetValues,

    // Draft status
    hasDraft,
    isSubmittingFromDraft,

    // Actions
    startFresh,
    startFromRepeat,
    resumeDraft,
    discardDraft,
    persistDraft,
    clearOnSuccess,
    markSubmitting,
  };
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useWorkoutDraft.ts
git commit -m "feat: add useWorkoutDraft hook for draft lifecycle management"
```

---

### Task 1.5: DraftPrompt component

**Files:**
- Create: `client/src/components/TrackWorkout/DraftPrompt.tsx`
- Modify: `client/src/i18n/locales/hr.json`

- [ ] **Step 1: Add i18n keys for draft prompt**

Add to `hr.json` under `training.draft`:

```json
"draft": {
  "resumeTitle": "Imate nespremljeni trening",
  "resumeDescription": "Pronašli smo vaš trening u tijeku. Želite li nastaviti ili započeti ispočetka?",
  "resume": "Nastavi trening",
  "startFresh": "Započni ispočetka",
  "submittingTitle": "Vaš trening se sprema...",
  "submittingDescription": "Trening je u procesu spremanja. Pokušajte ponovo ako se ne završi.",
  "retry": "Pokušaj ponovo",
  "discardTitle": "Odbaci trening?",
  "discardConfirm": "Da, odbaci",
  "discardCancel": "Ne, nastavi",
  "repeatLast": "Ponovi zadnji trening"
}
```

- [ ] **Step 2: Create DraftPrompt component**

```tsx
// client/src/components/TrackWorkout/DraftPrompt.tsx
import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

type DraftPromptProps = {
  isSubmitting: boolean;
  hasRepeatOption: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  onRepeatLast: () => void;
  onRetry: () => void;
};

const DraftPrompt = ({
  isSubmitting,
  hasRepeatOption,
  onResume,
  onStartFresh,
  onRepeatLast,
  onRetry,
}: DraftPromptProps) => {
  const { t } = useTranslation();

  if (isSubmitting) {
    return (
      <Card withBorder radius="md" p="xl" shadow="sm">
        <Stack align="center" gap="md">
          <Title order={3}>{t("training.draft.submittingTitle")}</Title>
          <Text c="dimmed" ta="center">
            {t("training.draft.submittingDescription")}
          </Text>
          <Button onClick={onRetry}>{t("training.draft.retry")}</Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="xl" shadow="sm">
      <Stack align="center" gap="md">
        <Title order={3}>{t("training.draft.resumeTitle")}</Title>
        <Text c="dimmed" ta="center">
          {t("training.draft.resumeDescription")}
        </Text>
        <Group>
          <Button onClick={onResume}>{t("training.draft.resume")}</Button>
          <Button variant="light" onClick={onStartFresh}>
            {t("training.draft.startFresh")}
          </Button>
          {hasRepeatOption && (
            <Button variant="subtle" onClick={onRepeatLast}>
              {t("training.draft.repeatLast")}
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default DraftPrompt;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add client/src/components/TrackWorkout/DraftPrompt.tsx client/src/i18n/locales/hr.json
git commit -m "feat: add DraftPrompt component with resume/discard/repeat options"
```

---

### Task 1.6: Analytics Event model + service + validator (server)

**Files:**
- Create: `server/models/AnalyticsEvent.js`
- Create: `server/services/analyticsEventService.js`
- Create: `server/validators/analyticsEventValidator.js`
- Test: `server/__tests__/analyticsEventService.test.js`

- [ ] **Step 1: Write failing test for analytics event service**

```javascript
// server/__tests__/analyticsEventService.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createEvent } = require("../services/analyticsEventService");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("analyticsEventService", () => {
  it("creates an event with userId, event name, and payload", async () => {
    const result = await createEvent({
      userId: new mongoose.Types.ObjectId().toString(),
      event: "workout_started",
      payload: { workoutId: "w1", source: "fresh" },
    });

    expect(result.event).toBe("workout_started");
    expect(result.payload).toEqual({ workoutId: "w1", source: "fresh" });
    expect(result.userId).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it("creates an event without payload", async () => {
    const result = await createEvent({
      userId: new mongoose.Types.ObjectId().toString(),
      event: "workout_completed",
    });

    expect(result.event).toBe("workout_completed");
    expect(result.payload).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- --testPathPattern=analyticsEventService 2>&1 | tail -20`
Expected: FAIL — module not found

- [ ] **Step 3: Create AnalyticsEvent model**

```javascript
// server/models/AnalyticsEvent.js
const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  event: { type: String, required: true, maxlength: 100 },
  payload: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Note: userId is optional (default: null) because the unauthenticated
// /abandoned sub-route creates events without a logged-in user.

analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
analyticsEventSchema.index({ event: 1, createdAt: 1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

module.exports = { AnalyticsEvent };
```

- [ ] **Step 4: Create analyticsEventService**

```javascript
// server/services/analyticsEventService.js
const { AnalyticsEvent } = require("../models/AnalyticsEvent");

const createEvent = async ({ userId, event, payload = null }) => {
  return AnalyticsEvent.create({ userId, event, payload });
};

module.exports = { createEvent };
```

- [ ] **Step 5: Create analyticsEventValidator**

```javascript
// server/validators/analyticsEventValidator.js
const AppError = require("../utils/AppError");

const validateCreateEventRequest = (request) => {
  const { event, payload } = request.body ?? {};

  if (!event || typeof event !== "string" || event.trim().length === 0) {
    throw new AppError("Naziv događaja je obavezan.", 400);
  }

  if (event.length > 100) {
    throw new AppError("Naziv događaja ne smije biti duži od 100 znakova.", 400);
  }

  if (payload !== undefined && payload !== null && typeof payload !== "object") {
    throw new AppError("Payload mora biti objekt.", 400);
  }
};

const validateAbandonedEventRequest = (request) => {
  const { event, payload } = request.body ?? {};

  if (event !== "workout_abandoned") {
    throw new AppError("Samo workout_abandoned događaji su dozvoljeni.", 400);
  }

  if (payload !== undefined && payload !== null && typeof payload !== "object") {
    throw new AppError("Payload mora biti objekt.", 400);
  }
};

module.exports = { validateCreateEventRequest, validateAbandonedEventRequest };
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=analyticsEventService 2>&1 | tail -20`
Expected: 2 tests PASS

- [ ] **Step 7: Commit**

```bash
git add server/models/AnalyticsEvent.js server/services/analyticsEventService.js server/validators/analyticsEventValidator.js server/__tests__/analyticsEventService.test.js
git commit -m "feat: add AnalyticsEvent model, service, and validator"
```

---

### Task 1.7: Analytics Event controller + routes + mount

**Files:**
- Create: `server/controllers/analyticsEventController.js`
- Create: `server/routes/analyticsEventRoutes.js`
- Modify: `server/middleware/rateLimiters.js`
- Modify: `server/index.js`

- [ ] **Step 1: Create analytics event controller**

```javascript
// server/controllers/analyticsEventController.js
const asyncHandler = require("../middleware/asyncHandler");
const analyticsEventService = require("../services/analyticsEventService");

exports.createEvent = asyncHandler(async (req, res) => {
  await analyticsEventService.createEvent({
    userId: req.userId,
    event: req.body.event,
    payload: req.body.payload ?? null,
  });

  res.status(201).json({ status: "success" });
});

exports.createAbandonedEvent = asyncHandler(async (req, res) => {
  await analyticsEventService.createEvent({
    userId: null,
    event: "workout_abandoned",
    payload: req.body.payload ?? null,
  });

  res.status(201).json({ status: "success" });
});
```

Note: The abandoned event controller uses `userId: null` because the `/abandoned` sub-route is unauthenticated. The model already has `userId: { default: null }` (set in Task 1.6) to support this.

- [ ] **Step 2: Add analytics event rate limiter**

Add to `server/middleware/rateLimiters.js`:

```javascript
const analyticsEventLimiter = rateLimit({
  ...standardRateLimitOptions,
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: getUserRateLimitKey,
  message: createRateLimitMessage(
    "Previše analitičkih zahtjeva. Pokušajte ponovo za 1 minutu.",
  ),
});
```

Add `analyticsEventLimiter` to the `module.exports`.

- [ ] **Step 3: Create analytics event routes**

```javascript
// server/routes/analyticsEventRoutes.js
const express = require("express");
const analyticsEventController = require("../controllers/analyticsEventController");
const { protect } = require("../middleware/authMiddleware");
const { analyticsEventLimiter } = require("../middleware/rateLimiters");
const validate = require("../middleware/validate");
const {
  validateCreateEventRequest,
  validateAbandonedEventRequest,
} = require("../validators/analyticsEventValidator");

const router = express.Router();

router.use(analyticsEventLimiter);

router.post(
  "/abandoned",
  validate(validateAbandonedEventRequest),
  analyticsEventController.createAbandonedEvent,
);

router.use(protect);

router.post(
  "/",
  validate(validateCreateEventRequest),
  analyticsEventController.createEvent,
);

module.exports = router;
```

- [ ] **Step 4: Mount routes in index.js**

Add to `server/index.js` after the existing route imports:

```javascript
const analyticsEventRoutes = require("./routes/analyticsEventRoutes");
```

Add the mount line after the existing `/api/v1/analytics` mount:

```javascript
app.use("/api/v1/analytics-events", analyticsEventRoutes);
```

- [ ] **Step 5: Verify server starts**

Run: `cd server && node -e "require('./index')" 2>&1 | head -5`
Expected: no require/syntax errors

- [ ] **Step 6: Commit**

```bash
git add server/controllers/analyticsEventController.js server/routes/analyticsEventRoutes.js server/middleware/rateLimiters.js server/index.js server/models/AnalyticsEvent.js
git commit -m "feat: add analytics event endpoint with rate limiting"
```

---

### Task 1.8: useTrackEvent client hook

**Files:**
- Create: `client/src/hooks/useTrackEvent.ts`

- [ ] **Step 1: Create the useTrackEvent hook**

```typescript
// client/src/hooks/useTrackEvent.ts
import { useCallback } from "react";
import { apiClient } from "@/utils/apiService";
import { API_BASE_URL } from "@/utils/apiService";

type TrackEventPayload = Record<string, unknown>;

export const useTrackEvent = () => {
  const trackEvent = useCallback(
    (event: string, payload?: TrackEventPayload) => {
      apiClient
        .post("/analytics-events", { event, payload: payload ?? null })
        .catch(() => {});
    },
    [],
  );

  return trackEvent;
};

export const sendAbandonedEvent = (payload: TrackEventPayload): void => {
  try {
    navigator.sendBeacon(
      `${API_BASE_URL}/analytics-events/abandoned`,
      new Blob(
        [JSON.stringify({ event: "workout_abandoned", payload })],
        { type: "application/json" },
      ),
    );
  } catch {
    // Best-effort — ignore failures
  }
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useTrackEvent.ts
git commit -m "feat: add useTrackEvent hook and sendAbandonedEvent for analytics"
```

---

## Phase 2: Fast Set Entry UX (Days 2–3)

### Task 2.1: Carry-over defaults and collapsed set states

**Files:**
- Modify: `client/src/components/TrackWorkout/TrackWorkoutWorkoutCard.tsx`
- Modify: `client/src/i18n/locales/hr.json`

- [ ] **Step 1: Add i18n keys for set states**

Add to `hr.json` under `training.track`:

```json
"copyPrevious": "Kopiraj prethodni",
"setCompleted": "Set {{number}} završen",
"setUpcoming": "Set {{number}}"
```

- [ ] **Step 2: Refactor TrackWorkoutWorkoutCard for set states**

Update the component to show three visual states for sets:

1. **Completed sets** (index < completedSetCount): collapsed single-line summary
2. **Active set** (index === completedSetCount): full input fields
3. **Upcoming sets** (index > completedSetCount): dimmed, no inputs

Add a new prop `completedSetCount` (number of sets saved for current exercise) and `onCopyPrevious` callback. Add `inputMode` attributes to NumberInput components.

The key changes to the set rendering loop:

```tsx
{setFields.map((field, setIndex) => {
  const isCompleted = setIndex < completedSetCount;
  const isActive = setIndex === completedSetCount;

  if (isCompleted) {
    return (
      <Card key={field.id} withBorder radius="md" p="xs" bg="var(--mantine-color-gray-light)">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {t("training.track.setCompleted", { number: setIndex + 1 })}
          </Text>
          <Text size="xs" c="dimmed">
            {watchedSets?.[setIndex]?.loadKg ?? "BW"} kg ·{" "}
            {watchedSets?.[setIndex]?.resultValue ?? 0} {currentMetric.unitLabel} ·{" "}
            RPE {watchedSets?.[setIndex]?.rpe ?? 0}
          </Text>
        </Group>
      </Card>
    );
  }

  if (!isActive) {
    return (
      <Card key={field.id} withBorder radius="md" p="xs" opacity={0.5}>
        <Text size="sm" c="dimmed">
          {t("training.track.setUpcoming", { number: setIndex + 1 })}
        </Text>
      </Card>
    );
  }

  // Active set — full inputs with inputMode and copy-previous button
  return (
    <Card key={field.id} withBorder radius="md" p="xs">
      <Group justify="space-between" align="center" mb={8}>
        <Text size="sm" fw={600}>
          {t("training.track.setNumber", { number: setIndex + 1 })}
        </Text>
        {setIndex > 0 && (
          <Button
            variant="subtle"
            size="compact-xs"
            onClick={() => onCopyPrevious(setIndex)}
          >
            {t("training.track.copyPrevious")}
          </Button>
        )}
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
        {/* Weight input with inputMode="decimal" */}
        <Controller
          control={control}
          name={`sets.${setIndex}.loadKg`}
          rules={{ /* existing rules */ }}
          render={({ field: setField }) => (
            <NumberInput
              label={t("training.track.weightOptional")}
              min={0}
              size="sm"
              inputMode="decimal"
              value={setField.value ?? undefined}
              onChange={(value) =>
                setField.onChange(typeof value === "number" ? value : null)
              }
              error={errors.sets?.[setIndex]?.loadKg?.message}
            />
          )}
        />
        {/* Reps input with inputMode="numeric" */}
        <Controller
          control={control}
          name={`sets.${setIndex}.resultValue`}
          rules={{ /* existing rules */ }}
          render={({ field: setField }) => (
            <NumberInput
              label={currentMetric.label}
              min={1}
              size="sm"
              inputMode="numeric"
              value={setField.value}
              onChange={(value) => setField.onChange(Number(value) || 0)}
              error={errors.sets?.[setIndex]?.resultValue?.message}
              required
            />
          )}
        />
        {/* RPE input with inputMode="numeric" */}
        <Controller
          control={control}
          name={`sets.${setIndex}.rpe`}
          rules={{ /* existing rules */ }}
          render={({ field: setField }) => (
            <NumberInput
              label="RPE"
              min={1}
              max={10}
              size="sm"
              inputMode="numeric"
              value={setField.value}
              onChange={(value) => setField.onChange(Number(value) || 1)}
              error={errors.sets?.[setIndex]?.rpe?.message}
              required
            />
          )}
        />
      </SimpleGrid>
    </Card>
  );
})}
```

Note: The current architecture treats all sets as the form state for one exercise, submitted together when the user clicks "Save and continue". The `completedSetCount` prop can initially be `0` (all sets active and editable simultaneously, as they are now), and set-by-set progression can be added as a follow-up. For this task, the key changes are: `inputMode` attributes, copy-previous button, and the visual summary line.

- [ ] **Step 3: Add copy-previous handler and new props**

Add to `TrackWorkoutWorkoutCardProps`:

```typescript
onCopyPrevious?: (setIndex: number) => void;
```

The copy-previous handler will be wired from `TrackWorkoutPageContent` using `setValue` from React Hook Form:

```typescript
const handleCopyPrevious = useCallback(
  (setIndex: number) => {
    if (setIndex < 1) return;
    const prevSet = watchedSets?.[setIndex - 1];
    if (!prevSet) return;
    setValue(`sets.${setIndex}.loadKg`, prevSet.loadKg);
    setValue(`sets.${setIndex}.resultValue`, prevSet.resultValue);
    setValue(`sets.${setIndex}.rpe`, prevSet.rpe);
  },
  [watchedSets, setValue],
);
```

- [ ] **Step 4: Verify TypeScript compiles and build succeeds**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add client/src/components/TrackWorkout/TrackWorkoutWorkoutCard.tsx client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx client/src/i18n/locales/hr.json
git commit -m "feat: add copy-previous, inputMode, and visual set states to workout card"
```

---

### Task 2.2: Carry-over defaults on set save

**Files:**
- Modify: `client/src/hooks/useWorkoutDraft.ts` (or `useTrackWorkoutFlow.ts`)

- [ ] **Step 1: Add carry-over logic**

When advancing from one exercise's form to the next, the first set of the new exercise should pre-fill from the last set of the previous exercise if the metric type matches. This logic belongs in the flow hook when initializing form defaults for the next exercise.

In `useExerciseProgression`, update the `useEffect` that calls `reset`:

```typescript
useEffect(() => {
  const defaultSets = createDefaultSets(plannedSetCount, currentPrescribedLoadKg);
  // No carry-over needed — each exercise starts with its own prescribed values
  // Carry-over is within an exercise (set N → set N+1), handled by copy-previous button
  reset({ sets: defaultSets });
}, [currentExercise?.exerciseId, currentPrescribedLoadKg, plannedSetCount, reset]);
```

**Automatic carry-over:** The spec says "After saving Set N, Set N+1 auto-fills with Set N's values." Since all sets for an exercise are rendered simultaneously as a form, "saving Set N" means the user just filled in Set N's values. We implement carry-over by pre-filling all sets from Set 1's values when the form initializes, so the user only edits what changed.

Update `createDefaultSets` in `useExerciseProgression.ts` to accept optional carry-over values:

```typescript
export const createDefaultSets = (
  setCount: number,
  prescribedLoadKg: number | null | undefined,
  carryOver?: { loadKg: number | null; resultValue: number; rpe: number },
): TrackWorkoutFormValues["sets"] =>
  Array.from({ length: Math.max(1, setCount) }, () => ({
    loadKg: carryOver?.loadKg ?? prescribedLoadKg ?? null,
    resultValue: carryOver?.resultValue ?? 0,
    rpe: carryOver?.rpe ?? 6,
  }));
```

When advancing to the next exercise, pass the last set's values from the previous exercise as carry-over (only if metric type matches — skip carry-over for different metric types).

**Auto-focus:** Add a `useEffect` in `TrackWorkoutWorkoutCard` that focuses the first input field when the active exercise changes:

```typescript
import { useEffect, useRef } from "react";

const firstInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  // Focus first input when exercise changes
  setTimeout(() => firstInputRef.current?.focus(), 100);
}, [currentIndex]);

// On the first NumberInput of the active set:
// ref={setIndex === 0 ? firstInputRef : undefined}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useExerciseProgression.ts client/src/components/TrackWorkout/TrackWorkoutWorkoutCard.tsx
git commit -m "feat: add automatic set carry-over defaults and auto-focus"
```

---

## Phase 3: Rest Timer (Days 3–4)

### Task 3.1: Add restSeconds to Workout model

**Files:**
- Modify: `server/models/Workout.js`
- Modify: `client/src/types/Workout/workout.ts`

- [ ] **Step 1: Add restSeconds to server model**

In `server/models/Workout.js`, add to `workoutExerciseSchema`:

```javascript
restSeconds: { type: Number, min: 0, max: 600, default: null },
```

- [ ] **Step 2: Add restSeconds to client type**

In `client/src/types/Workout/workout.ts`, add to `WorkoutExercise`:

```typescript
restSeconds?: number | null;
```

- [ ] **Step 3: Add restSeconds validation to workoutValidator.js**

In `server/validators/workoutValidator.js`, find the exercise validation loop inside create/update workout validators. Add validation for the optional `restSeconds` field:

```javascript
if (exercise.restSeconds !== undefined && exercise.restSeconds !== null) {
  validateNumberInRange(exercise.restSeconds, {
    min: 0,
    max: 600,
    message: `Odmor za vježbu ${index + 1} mora biti između 0 i 600 sekundi.`,
  });
}
```

- [ ] **Step 4: Verify both compile**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -5`
Run: `cd server && node -e "require('./models/Workout')" 2>&1`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add server/models/Workout.js server/validators/workoutValidator.js client/src/types/Workout/workout.ts
git commit -m "feat: add restSeconds field to workout exercise schema with validation"
```

---

### Task 3.2: useRestTimer hook

**Files:**
- Create: `client/src/hooks/useRestTimer.ts`
- Test: `client/src/__tests__/useRestTimer.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// client/src/__tests__/useRestTimer.test.ts
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRestTimer } from "@/hooks/useRestTimer";

describe("useRestTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("starts with remaining 0 and not running", () => {
    const { result } = renderHook(() => useRestTimer());
    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("starts a timer and counts down", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(90));
    expect(result.current.isRunning).toBe(true);
    expect(result.current.remaining).toBeGreaterThan(0);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBeLessThanOrEqual(89);
  });

  it("reaches 0 and stops", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(2));
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("pause and resume work", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(60));
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.pause());

    expect(result.current.isRunning).toBe(false);
    const paused = result.current.remaining;

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.remaining).toBe(paused);

    act(() => result.current.resume());
    expect(result.current.isRunning).toBe(true);
  });

  it("reset stops the timer", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(60));
    act(() => result.current.reset());

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/__tests__/useRestTimer.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found

- [ ] **Step 3: Implement useRestTimer**

```typescript
// client/src/hooks/useRestTimer.ts
import { useCallback, useEffect, useRef, useState } from "react";

export const useRestTimer = () => {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRemainingRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
    setRemaining(left);

    if (left <= 0) {
      clearTimer();
      setIsRunning(false);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(200);
        } catch {
          // no-op on desktop
        }
      }
    }
  }, [clearTimer]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      endTimeRef.current = Date.now() + seconds * 1000;
      setRemaining(seconds);
      setIsRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    },
    [clearTimer, tick],
  );

  const pause = useCallback(() => {
    if (!isRunning) return;
    clearTimer();
    pausedRemainingRef.current = Math.max(
      0,
      Math.ceil((endTimeRef.current - Date.now()) / 1000),
    );
    setRemaining(pausedRemainingRef.current);
    setIsRunning(false);
  }, [clearTimer, isRunning]);

  const resume = useCallback(() => {
    if (isRunning || pausedRemainingRef.current <= 0) return;
    endTimeRef.current = Date.now() + pausedRemainingRef.current * 1000;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, tick]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setIsRunning(false);
    pausedRemainingRef.current = 0;
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { remaining, isRunning, start, pause, resume, reset };
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/__tests__/useRestTimer.test.ts 2>&1 | tail -20`
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/useRestTimer.ts client/src/__tests__/useRestTimer.test.ts
git commit -m "feat: add useRestTimer hook with absolute-timestamp countdown"
```

---

### Task 3.3: RestTimer component

**Files:**
- Create: `client/src/components/TrackWorkout/RestTimer.tsx`
- Modify: `client/src/i18n/locales/hr.json`

- [ ] **Step 1: Add i18n keys for rest timer**

Add to `hr.json` under `training.timer`:

```json
"timer": {
  "restTime": "Odmor",
  "pause": "Pauza",
  "resume": "Nastavi",
  "dismiss": "Odbaci",
  "preset60": "60s",
  "preset90": "90s",
  "preset120": "120s"
}
```

- [ ] **Step 2: Create RestTimer component**

```tsx
// client/src/components/TrackWorkout/RestTimer.tsx
import { ActionIcon, Badge, Card, Group, SegmentedControl, Text } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRestTimer } from "@/hooks/useRestTimer";

const REST_PRESETS = [60, 90, 120] as const;
const PRESET_STORAGE_KEY = "atletikum_rest_timer_preset";

const getStoredPreset = (): number => {
  try {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    if (stored) {
      const num = Number(stored);
      if (REST_PRESETS.includes(num as typeof REST_PRESETS[number])) return num;
    }
  } catch {
    // ignore
  }
  return 90;
};

type RestTimerProps = {
  exerciseRestSeconds?: number | null;
  visible: boolean;
  triggerCount: number; // Incremented each time a set is saved — triggers auto-start
};

const RestTimerComponent = ({
  exerciseRestSeconds,
  visible,
  triggerCount,
}: RestTimerProps) => {
  const { t } = useTranslation();
  const { remaining, isRunning, start, pause, resume, reset } = useRestTimer();
  const [preset, setPreset] = useState<number>(getStoredPreset);

  const effectiveDuration = exerciseRestSeconds ?? preset;

  // Auto-start timer when triggerCount increments (i.e., a set was just saved)
  const prevTriggerRef = useRef(triggerCount);
  useEffect(() => {
    if (triggerCount > prevTriggerRef.current) {
      start(effectiveDuration);
    }
    prevTriggerRef.current = triggerCount;
  }, [triggerCount, effectiveDuration, start]);

  const handlePresetChange = useCallback(
    (value: string) => {
      const num = Number(value);
      setPreset(num);
      try {
        localStorage.setItem(PRESET_STORAGE_KEY, String(num));
      } catch {
        // ignore
      }
      if (isRunning || remaining > 0) {
        start(num);
      }
    },
    [isRunning, remaining, start],
  );

  const handleStart = useCallback(() => {
    start(effectiveDuration);
  }, [effectiveDuration, start]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!visible && remaining <= 0) return null;

  return (
    <Card
      withBorder
      radius="xl"
      p="xs"
      px="md"
      shadow="lg"
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        minWidth: 280,
      }}
    >
      <Group justify="space-between" gap="xs">
        <Group gap="xs">
          <Text fw={700} size="lg" ff="monospace">
            {remaining > 0 ? formatTime(remaining) : t("training.timer.restTime")}
          </Text>
          {remaining <= 0 && (
            <Badge
              variant="light"
              style={{ cursor: "pointer" }}
              onClick={handleStart}
            >
              {formatTime(effectiveDuration)}
            </Badge>
          )}
        </Group>

        {remaining > 0 && (
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={isRunning ? pause : resume}
              aria-label={isRunning ? t("training.timer.pause") : t("training.timer.resume")}
            >
              {isRunning ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={reset}
              aria-label={t("training.timer.dismiss")}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        )}

        {!exerciseRestSeconds && (
          <SegmentedControl
            size="xs"
            value={String(preset)}
            onChange={handlePresetChange}
            data={REST_PRESETS.map((p) => ({
              label: t(`training.timer.preset${p}`),
              value: String(p),
            }))}
          />
        )}
      </Group>
    </Card>
  );
};

export default RestTimerComponent;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add client/src/components/TrackWorkout/RestTimer.tsx client/src/i18n/locales/hr.json
git commit -m "feat: add RestTimer floating pill component with presets"
```

---

### Task 3.4: Mount RestTimer in TrackWorkoutPageContent

**Files:**
- Modify: `client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx`

- [ ] **Step 1: Import and mount RestTimer**

Add import and render RestTimerComponent below the TrackWorkoutWorkoutCard:

```tsx
import RestTimerComponent from "./RestTimer";

// Add state to track set saves (incremented each time exercise is submitted):
const [setSaveTrigger, setSetSaveTrigger] = useState(0);

// In the submitCurrentExercise handler, increment trigger after a successful submit:
// setSetSaveTrigger((prev) => prev + 1);

// Inside the JSX, after TrackWorkoutWorkoutCard:
<RestTimerComponent
  exerciseRestSeconds={currentExercise.restSeconds}
  visible={!!currentExercise && !isLastExercise}
  triggerCount={setSaveTrigger}
/>
```

The timer auto-starts when `triggerCount` increments (via the `useEffect` in RestTimerComponent). It is hidden during the final exercise submission (`!isLastExercise`).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -5`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx
git commit -m "feat: mount RestTimer in workout tracking flow"
```

---

## Phase 4: Wire Auto-Save + TTL Cleanup + Discard UX (Days 4–5)

### Task 4.1: Wire auto-save triggers

**Files:**
- Modify: `client/src/hooks/useTrackWorkoutFlow.ts`
- Modify: `client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx`

- [ ] **Step 1: Integrate useWorkoutDraft into useTrackWorkoutFlow**

Replace the standalone `useState` calls in `useTrackWorkoutFlow` with `useWorkoutDraft`:

```typescript
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

export const useTrackWorkoutFlow = ({ workout }: UseTrackWorkoutFlowParams) => {
  const draft = useWorkoutDraft({ workout });

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TrackWorkoutFormValues>({
    defaultValues: {
      sets: draft.initialSetValues.length > 0
        ? draft.initialSetValues
        : createDefaultSets(
            workout.exercises[draft.currentIndex]?.sets ?? 1,
            workout.exercises[draft.currentIndex]?.progression?.prescribedLoadKg ??
              workout.exercises[draft.currentIndex]?.progression?.initialWeightKg ??
              null,
          ),
    },
  });

  const { fields: setFields } = useFieldArray({ control, name: "sets" });
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const {
    advanceToNextExercise,
    completedExerciseCount,
    currentExercise,
    currentMetric,
    getUpdatedCompletedExercises,
    isLastExercise,
    plannedSetCount,
    progressValue,
    totalExercises,
    watchedSets,
  } = useExerciseProgression({
    control,
    reset,
    workout,
    currentIndex: draft.currentIndex,
    setCurrentIndex: draft.setCurrentIndex,
    completedExercises: draft.completedExercises,
    setCompletedExercises: draft.setCompletedExercises,
  });

  // Pass idempotencyKey from the draft so completeWorkout uses it when calling mutateAsync
  const { completeWorkout, isSubmitting } = useWorkoutCompletion({
    workout,
    idempotencyKey: draft.idempotencyKey,
  });

  const submitCurrentExercise: SubmitHandler<TrackWorkoutFormValues> = async (values) => {
    if (!currentExercise) return;

    const areAllSetsValid = await trigger("sets");
    if (!areAllSetsValid) return;

    const updatedCompletedExercises = getUpdatedCompletedExercises(values);

    if (isLastExercise) {
      draft.markSubmitting(true);
      draft.persistDraft(
        draft.currentIndex,
        updatedCompletedExercises,
        values.sets,
        true,
      );
      try {
        // completeWorkout closes over idempotencyKey from useWorkoutCompletion params
        await completeWorkout(updatedCompletedExercises);
        draft.clearOnSuccess();
      } catch (error) {
        draft.markSubmitting(false);
        draft.persistDraft(
          draft.currentIndex,
          updatedCompletedExercises,
          values.sets,
          false,
        );
        throw error;
      }
      return;
    }

    advanceToNextExercise(updatedCompletedExercises);
    // Auto-save after advancing
    const nextSets = getValues("sets");
    draft.persistDraft(
      draft.currentIndex + 1,
      updatedCompletedExercises,
      nextSets,
    );
  };

  return {
    ...draft,
    completedExerciseCount,
    control,
    currentExercise,
    currentIndex: draft.currentIndex,
    currentMetric,
    errors,
    isSubmitting: isSubmitting || draft.submitting,
    onSubmitCurrentExercise: handleSubmit(submitCurrentExercise),
    plannedSetCount,
    progressValue,
    selectedExerciseId,
    setFields,
    setSelectedExerciseId,
    totalExercises,
    watchedSets,
  };
};
```

- [ ] **Step 2: Wire DraftPrompt in TrackWorkoutPageContent**

Update `TrackWorkoutPageContent` to handle all entry states. The component now manages four cases:

1. **Draft exists, `submitting: true`** → show DraftPrompt with retry
2. **Draft exists, `submitting: false`** → show DraftPrompt with resume/discard
3. **No draft, `draftSource` is null** → auto-call `startFresh()` in a `useEffect`
4. **`draftSource` is set** → render the normal workout form

```tsx
import { useEffect } from "react";
import DraftPrompt from "./DraftPrompt";

// Inside the component, before the main return:

// Case 3: No draft, no decision yet → auto-start fresh
useEffect(() => {
  if (!hasDraft && draftSource === null) {
    startFresh();
  }
}, [hasDraft, draftSource, startFresh]);

// Cases 1 & 2: Draft exists but user hasn't chosen yet
if (hasDraft && draftSource === null) {
  return (
    <Stack w="100%" maw={700} mx="auto" px="sm" py="md">
      <DraftPrompt
        isSubmitting={isSubmittingFromDraft}
        hasRepeatOption={false} // Wired in Phase 5
        onResume={resumeDraft}
        onStartFresh={() => {
          discardDraft();
          startFresh();
        }}
        onRepeatLast={() => {}} // Wired in Phase 5
        onRetry={() => {
          resumeDraft();
        }}
      />
    </Stack>
  );
}

// Case 4: draftSource is null and no hasDraft → useEffect will call startFresh,
// show spinner while waiting
if (draftSource === null) {
  return <SpinnerComponent size="md" fullHeight={false} />;
}

// Normal workout form follows...
```

Note: In Phase 5 (Task 5.3), this logic is extended: when `hasDraft` is false AND `latestLog` exists with a strict exercise match, we show a different prompt with "Start fresh" + "Repeat last session" instead of auto-starting fresh.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useTrackWorkoutFlow.ts client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx
git commit -m "feat: wire draft auto-save on exercise advance and submission"
```

---

### Task 4.2: Discard draft button + beforeunload abandoned event

**Files:**
- Modify: `client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx`
- Modify: `client/src/i18n/locales/hr.json`

- [ ] **Step 1: Add discard button and abandoned event**

Add a "Discard" button to the workout overview area. Add a `beforeunload` handler that fires `sendAbandonedEvent`:

```typescript
import { useEffect } from "react";
import { sendAbandonedEvent } from "@/hooks/useTrackEvent";

// Inside TrackWorkoutPageContent:
useEffect(() => {
  const handleBeforeUnload = () => {
    if (draftSource) {
      sendAbandonedEvent({
        workoutId: workout._id,
        exerciseIndex: currentIndex,
      });
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [draftSource, workout._id, currentIndex]);
```

Add i18n key:
```json
"discardDraft": "Odbaci trening"
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -5`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx client/src/i18n/locales/hr.json
git commit -m "feat: add discard draft button and beforeunload abandoned analytics"
```

---

## Phase 5: Repeat Last Workout (Days 6–7)

### Task 5.1: Server — getLatestWorkoutLog endpoint

**Files:**
- Modify: `server/services/workoutLogService.js`
- Modify: `server/controllers/workoutLogController.js`
- Modify: `server/routes/workoutLogRoutes.js`
- Modify: `server/validators/workoutLogValidator.js`
- Test: `server/__tests__/workoutLogService.test.js` (add test)

- [ ] **Step 1: Write failing test for getLatestWorkoutLog**

```javascript
// server/__tests__/getLatestWorkoutLog.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { WorkoutLog } = require("../models/WorkoutLog");
const { getLatestWorkoutLog } = require("../services/workoutLogService");

let mongoServer;
const testUserId = new mongoose.Types.ObjectId().toString();
const testWorkoutId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await WorkoutLog.deleteMany({});
});

describe("getLatestWorkoutLog", () => {
  it("returns null when no logs exist for the workout", async () => {
    const result = await getLatestWorkoutLog({
      userId: testUserId,
      workoutId: testWorkoutId,
    });
    expect(result).toBeNull();
  });

  it("returns the most recent log when multiple exist", async () => {
    const olderLog = await WorkoutLog.create({
      user: testUserId,
      workoutId: testWorkoutId,
      workout: "Test",
      completedExercises: [
        { exerciseId: "e1", resultValue: 5, rpe: 6 },
      ],
      date: new Date("2026-03-01"),
    });
    const newerLog = await WorkoutLog.create({
      user: testUserId,
      workoutId: testWorkoutId,
      workout: "Test",
      completedExercises: [
        { exerciseId: "e1", resultValue: 8, rpe: 7 },
      ],
      date: new Date("2026-03-10"),
    });

    const result = await getLatestWorkoutLog({
      userId: testUserId,
      workoutId: testWorkoutId,
    });

    expect(result).not.toBeNull();
    expect(result._id.toString()).toBe(newerLog._id.toString());
    expect(result.completedExercises[0].resultValue).toBe(8);
  });

  it("does not return logs from other users", async () => {
    await WorkoutLog.create({
      user: new mongoose.Types.ObjectId().toString(),
      workoutId: testWorkoutId,
      workout: "Test",
      completedExercises: [
        { exerciseId: "e1", resultValue: 5, rpe: 6 },
      ],
    });

    const result = await getLatestWorkoutLog({
      userId: testUserId,
      workoutId: testWorkoutId,
    });
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Add service method**

Add to `server/services/workoutLogService.js`:

```javascript
const getLatestWorkoutLog = async ({ userId, workoutId }) => {
  const normalizedUserId = requireUserId({ userId });

  return WorkoutLog.findOne({
    user: normalizedUserId,
    workoutId,
  })
    .sort({ date: -1 })
    .lean();
};
```

Add to `module.exports`: `getLatestWorkoutLog`.

- [ ] **Step 3: Add controller method**

Add to `server/controllers/workoutLogController.js`:

```javascript
exports.getLatestWorkoutLog = asyncHandler(async (req, res) => {
  const workoutLog = await workoutLogService.getLatestWorkoutLog({
    userId: req.userId,
    workoutId: req.params.workoutId,
  });

  if (!workoutLog) {
    return res.status(204).send();
  }

  res.status(200).json({
    status: "success",
    data: { workoutLog },
  });
});
```

- [ ] **Step 4: Add validator**

Add to `server/validators/workoutLogValidator.js`:

```javascript
const validateGetLatestWorkoutLogRequest = (request) => {
  validateObjectId(request.params.workoutId, "Workout");
};
```

Add to `module.exports`: `validateGetLatestWorkoutLogRequest`.

- [ ] **Step 5: Add route**

In `server/routes/workoutLogRoutes.js`, add before the existing routes:

```javascript
const {
  validateCreateWorkoutLogRequest,
  validateGetLatestWorkoutLogRequest,
} = require("../validators/workoutLogValidator");

// Add this route (must be BEFORE the catch-all /)
router.get(
  "/latest/:workoutId",
  validate(validateGetLatestWorkoutLogRequest),
  workoutLogController.getLatestWorkoutLog,
);
```

- [ ] **Step 6: Verify server starts**

Run: `cd server && node -e "require('./index')" 2>&1 | head -5`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add server/services/workoutLogService.js server/controllers/workoutLogController.js server/routes/workoutLogRoutes.js server/validators/workoutLogValidator.js
git commit -m "feat: add GET /workout-logs/latest/:workoutId endpoint"
```

---

### Task 5.2: Client — useLatestWorkoutLog hook + query key + API function

**Files:**
- Modify: `client/src/lib/query-keys.ts`
- Modify: `client/src/api/workoutLogs.ts`
- Modify: `client/src/hooks/useWorkoutLogs.ts`

- [ ] **Step 1: Add query key**

In `client/src/lib/query-keys.ts`, add to `workoutLogs`:

```typescript
workoutLogs: {
    all: ['workout-logs'] as const,
    list: () => [...keys.workoutLogs.all, 'list'] as const,
    latest: (workoutId: string) => [...keys.workoutLogs.all, 'latest', workoutId] as const,
},
```

- [ ] **Step 2: Add API function**

In `client/src/api/workoutLogs.ts`:

```typescript
export async function getLatestWorkoutLog(
    workoutId: string,
): Promise<WorkoutLog | null> {
    const { data, status } = await apiClient.get<{
        status: string;
        data: { workoutLog: WorkoutLog };
    }>(`/workout-logs/latest/${workoutId}`, {
        validateStatus: (s) => s === 200 || s === 204,
    });

    if (status === 204) return null;
    return data.data.workoutLog;
}
```

- [ ] **Step 3: Add useLatestWorkoutLog hook and update useCreateWorkoutLog**

In `client/src/hooks/useWorkoutLogs.ts`:

```typescript
import {
    createWorkoutLog,
    getLatestWorkoutLog,
    getWorkoutLogs,
} from "@/api/workoutLogs";

export function useLatestWorkoutLog(workoutId: string, enabled = true) {
    return useQuery<WorkoutLog | null, Error>({
        queryKey: keys.workoutLogs.latest(workoutId),
        queryFn: () => getLatestWorkoutLog(workoutId),
        enabled: !!workoutId && enabled,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateWorkoutLog() {
    const queryClient = useQueryClient();

    return useMutation<CreateWorkoutLogResult, Error, WorkoutLogPayload>({
        mutationFn: createWorkoutLog,
        onSuccess: ({ workoutLog }) => {
            queryClient.setQueryData<WorkoutLog[] | undefined>(
                keys.workoutLogs.list(),
                (workoutLogs) => prependCachedEntity(workoutLogs, workoutLog),
            );
            queryClient.invalidateQueries({
                queryKey: keys.challenges.weekly(),
            });
            // Invalidate latest log so repeat-last shows fresh data
            queryClient.invalidateQueries({
                queryKey: keys.workoutLogs.latest(workoutLog.workoutId),
            });
        },
    });
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/query-keys.ts client/src/api/workoutLogs.ts client/src/hooks/useWorkoutLogs.ts
git commit -m "feat: add useLatestWorkoutLog hook with cache invalidation"
```

---

### Task 5.3: Wire repeat-last into TrackWorkout entry flow

**Files:**
- Modify: `client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx`
- Modify: `client/src/components/WorkoutLogs/WorkoutLogCard.tsx`
- Modify: `client/src/i18n/locales/hr.json`

- [ ] **Step 1: Add i18n keys**

```json
"repeatLast": "Ponovi zadnji trening",
"repeatLastDescription": "Započnite trening s vrijednostima iz zadnje sesije."
```

- [ ] **Step 2: Wire strict match and prefill in TrackWorkoutPageContent**

Import `useLatestWorkoutLog`, `getExerciseId`, and `useSearchParams`. On mount, check if latest log matches and if `?prefill=last` query param is present:

```typescript
import { useLatestWorkoutLog } from "@/hooks/useWorkoutLogs";
import { getExerciseId } from "@/types/Workout/workout";

// Inside the component (note: full destructure with isLoading shown later in the useEffect block):
const { data: latestLog } = useLatestWorkoutLog(
  workout._id,
  !hasDraft, // don't fetch if draft exists
);
// Note: In the useEffect section below, this is redeclared as
// const { data: latestLog, isLoading: isLatestLogLoading } = useLatestWorkoutLog(...)
// Use the single declaration with isLoading throughout — do not declare twice.

const hasRepeatOption = useMemo(() => {
  if (!latestLog) return false;
  const workoutExerciseIds = workout.exercises
    .map((e) => getExerciseId(e.exerciseId))
    .sort();
  const logExerciseIds = [
    ...new Set(latestLog.completedExercises.map((e) => e.exerciseId)),
  ].sort();
  return (
    workoutExerciseIds.length === logExerciseIds.length &&
    workoutExerciseIds.every((id, i) => id === logExerciseIds[i])
  );
}, [latestLog, workout.exercises]);
```

Wire `onRepeatLast` in DraftPrompt to build prefill data from `latestLog`.

Also handle the `?prefill=last` query param (from WorkoutLogCard CTA):

```typescript
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const prefillParam = searchParams.get("prefill");

// Destructure isLoading so the auto-start useEffect waits until the query settles.
// Without this guard, the useEffect fires before latestLog resolves and always
// calls startFresh(), suppressing the repeat-last prompt.
const {
  data: latestLog,
  isLoading: isLatestLogLoading,
} = useLatestWorkoutLog(workout._id, !hasDraft);

// Define handleRepeatLast (builds prefill data from latestLog and calls startFromRepeat):
const handleRepeatLast = useCallback(() => {
  if (!latestLog) return;

  // Group completed exercises from the log by exerciseId
  const setValuesByExercise = new Map<string, DraftSetValues[]>();
  for (const entry of latestLog.completedExercises) {
    const existing = setValuesByExercise.get(entry.exerciseId) ?? [];
    existing.push({
      loadKg: entry.loadKg ?? null,
      resultValue: entry.resultValue,
      rpe: entry.rpe,
    });
    setValuesByExercise.set(entry.exerciseId, existing);
  }

  startFromRepeat({
    completedExercises: [],
    setValuesByExercise,
  });

  setSearchParams({}, { replace: true }); // clear ?prefill=last
}, [latestLog, startFromRepeat, setSearchParams]);

// In the useEffect that handles auto-start:
useEffect(() => {
  // Wait until latestLog query has settled before deciding whether to start fresh
  // or show the repeat-last prompt. Without isLatestLogLoading guard, the effect
  // fires before the query resolves and always calls startFresh prematurely.
  if (!hasDraft && draftSource === null && !isLatestLogLoading) {
    if (prefillParam === "last" && hasRepeatOption && latestLog) {
      handleRepeatLast();
    } else if (!hasRepeatOption && !latestLog) {
      startFresh();
    }
    // If hasRepeatOption is true (no prefill param), show the prompt — don't auto-start
  }
}, [hasDraft, draftSource, isLatestLogLoading, prefillParam, hasRepeatOption, latestLog, handleRepeatLast, startFresh]);
```

- [ ] **Step 3: Add "Repeat this workout" CTA to WorkoutLogCard**

Add a link/button to `WorkoutLogCard` that navigates to `/zapis-treninga/{workoutId}?prefill=last`:

```tsx
import { useNavigate } from "react-router-dom";

// Inside WorkoutLogCard:
const navigate = useNavigate();

<Button
  variant="subtle"
  size="compact-xs"
  onClick={() => navigate(`/zapis-treninga/${log.workoutId}?prefill=last`)}
>
  {t("training.draft.repeatLast")}
</Button>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add client/src/components/TrackWorkout/TrackWorkoutPageContent.tsx client/src/components/WorkoutLogs/WorkoutLogCard.tsx client/src/i18n/locales/hr.json
git commit -m "feat: add repeat-last-workout with strict match and prefill"
```

---

## Phase 6: Submission Reliability (Days 7–8)

### Task 6.1: Server — idempotency key on WorkoutLog model

**Files:**
- Modify: `server/models/WorkoutLog.js`
- Modify: `server/services/workoutLogService.js`

- [ ] **Step 1: Add idempotencyKey field**

In `server/models/WorkoutLog.js`, add to the schema:

```javascript
idempotencyKey: { type: String, unique: true, sparse: true },
```

- [ ] **Step 2: Add idempotency check in service**

In `server/services/workoutLogService.js`, inside `createWorkoutLog`, before the duplicate time-window check:

```javascript
const idempotencyKey = payload.idempotencyKey || req?.headers?.["x-idempotency-key"];

if (idempotencyKey) {
  const existingLog = await attachSession(
    WorkoutLog.findOne({ idempotencyKey, user: normalizedUserId }).lean(),
    session,
  );
  if (existingLog) {
    return {
      workoutLog: existingLog,
      user: null,
      newAchievements: [],
      totalXpGained: existingLog.totalXpGained ?? 0,
      personalBests: (existingLog.completedExercises ?? []).filter(
        (e) => e.isPersonalBest,
      ),
    };
  }
}
```

Note: The service needs to receive the header. Update the controller to pass it:

```javascript
// In workoutLogController.js createWorkoutLog:
const result = await workoutLogService.createWorkoutLog({
  user: req.user,
  userId: req.userId,
  payload: req.body,
  idempotencyKey: req.headers["x-idempotency-key"],
});
```

And update the service signature:

```javascript
const createWorkoutLog = async ({ user, userId, payload, idempotencyKey }) => {
```

Add idempotencyKey to the created log:

```javascript
const workoutLog = await createWithSession(
  WorkoutLog,
  {
    user: normalizedUserId,
    workoutId: workoutDoc._id,
    workout: workoutDoc.title,
    requiredLevel: workoutDoc.requiredLevel,
    completedExercises: completedWithPersonalBests,
    totalXpGained: xpGain,
    ...(idempotencyKey ? { idempotencyKey } : {}),
  },
  session,
);
```

- [ ] **Step 3: Verify server starts**

Run: `cd server && node -e "require('./index')" 2>&1 | head -5`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add server/models/WorkoutLog.js server/services/workoutLogService.js server/controllers/workoutLogController.js
git commit -m "feat: add idempotency key support for workout log submission"
```

---

### Task 6.2: Client — send idempotency key + error mapping

**Files:**
- Modify: `client/src/api/workoutLogs.ts`
- Modify: `client/src/hooks/useWorkoutCompletion.ts`
- Modify: `client/src/types/WorkoutLog/workoutLog.ts`
- Modify: `client/src/i18n/locales/hr.json`

- [ ] **Step 1: Add error i18n keys**

```json
"workout": {
  "errors": {
    "alreadySaved": "Ovaj trening je već spremljen.",
    "validationFailed": "Podaci treninga nisu ispravni. Provjerite unesene vrijednosti.",
    "serverError": "Greška na serveru. Vaš napredak je spremljen lokalno — pokušajte ponovo.",
    "networkError": "Problem s vezom. Vaš napredak je spremljen lokalno — pokušajte ponovo."
  }
}
```

- [ ] **Step 2: Update API function to accept idempotency key**

In `client/src/api/workoutLogs.ts`, update `createWorkoutLog` to accept a **single object** parameter (required because TanStack Query's `mutateAsync` passes one argument to `mutationFn`):

```typescript
type CreateWorkoutLogParams = {
    payload: WorkoutLogPayload;
    idempotencyKey?: string;
};

export async function createWorkoutLog({
    payload,
    idempotencyKey,
}: CreateWorkoutLogParams): Promise<CreateWorkoutLogResult> {
    const parsedPayload = workoutLogSchema.safeParse(payload);
    if (!parsedPayload.success) {
        throw new Error(
            parsedPayload.error.issues[0]?.message || "Workout log is invalid.",
        );
    }

    const headers: Record<string, string> = {};
    if (idempotencyKey) {
        headers["X-Idempotency-Key"] = idempotencyKey;
    }

    const { data } = await apiClient.post<WorkoutLogResponse>(
        "/workout-logs",
        parsedPayload.data,
        { headers },
    );

    return {
        workoutLog: data.data.workoutLog,
        user: data.data.user,
        newAchievements: data.data.newAchievements,
        totalXpGained: data.data.totalXpGained,
        personalBests: data.data.personalBests,
    };
}
```

Then update `useCreateWorkoutLog` in `client/src/hooks/useWorkoutLogs.ts` to match the new parameter shape:

```typescript
export function useCreateWorkoutLog() {
    const queryClient = useQueryClient();

    return useMutation<CreateWorkoutLogResult, Error, CreateWorkoutLogParams>({
        mutationFn: createWorkoutLog,
        onSuccess: ({ workoutLog }) => {
            queryClient.setQueryData<WorkoutLog[] | undefined>(
                keys.workoutLogs.list(),
                (workoutLogs) => prependCachedEntity(workoutLogs, workoutLog),
            );
            queryClient.invalidateQueries({
                queryKey: keys.challenges.weekly(),
            });
            queryClient.invalidateQueries({
                queryKey: keys.workoutLogs.latest(workoutLog.workoutId),
            });
        },
    });
}
```

Import `CreateWorkoutLogParams` from the API module. All callers of `mutateAsync` must now pass `{ payload: { workoutId, completedExercises }, idempotencyKey }` instead of `{ workoutId, completedExercises }`.

Update `useWorkoutCompletion.ts` accordingly:

```typescript
const result = await createWorkoutLogMutation.mutateAsync({
  payload: { workoutId: workout._id, completedExercises },
  idempotencyKey,
});
```

- [ ] **Step 3: Update useWorkoutCompletion to handle errors with i18n**

In `client/src/hooks/useWorkoutCompletion.ts`, update the `completeWorkout` to accept and forward `idempotencyKey`, and handle 409 responses. Also add `import axios from "axios"`:

```typescript
import axios from "axios";

// Update the UseWorkoutCompletionParams type:
type UseWorkoutCompletionParams = {
  workout: Workout;
  idempotencyKey?: string;
};

// Update completeWorkout:
const completeWorkout = useCallback(
  async (completedExercises: CompletedExercisePayload[]) => {
    try {
      const result = await createWorkoutLogMutation.mutateAsync({
        payload: { workoutId: workout._id, completedExercises },
        idempotencyKey,
      });

      if (result.user) {
        updateUser(result.user);
      }

      const celebrationState = buildWorkoutCelebrationState(workout, result);
      persistCelebrationState(celebrationState);

      navigate("/slavlje", {
        replace: true,
        state: celebrationState,
      });
    } catch (error: unknown) {
      // If 409 (duplicate), the workout was already saved — navigate to celebration
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        navigate("/slavlje", { replace: true });
        return;
      }
      throw error;
    }
  },
  [createWorkoutLogMutation, idempotencyKey, navigate, updateUser, workout],
);
```

Note: `idempotencyKey` is now destructured from the hook's params (passed in from `useTrackWorkoutFlow` via the draft). The `completeWorkout` function signature no longer needs it as an argument — it closes over it from the hook params.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add client/src/api/workoutLogs.ts client/src/hooks/useWorkoutCompletion.ts client/src/types/WorkoutLog/workoutLog.ts client/src/i18n/locales/hr.json
git commit -m "feat: add idempotency key header and error mapping with Croatian messages"
```

---

## Phase 7: Tests (Days 8–9)

### Task 7.1: Client tests

**Files:**
- Create/update: `client/src/__tests__/useWorkoutDraft.test.ts`

- [ ] **Step 1: Write tests for useWorkoutDraft**

```typescript
// client/src/__tests__/useWorkoutDraft.test.ts
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { getDraft } from "@/utils/workoutDraftStorage";
import type { Workout } from "@/types/Workout/workout";

const createTestWorkout = (): Workout => ({
  _id: "w1",
  title: "Test Workout",
  description: "Test",
  requiredLevel: 1,
  exercises: [
    {
      exerciseId: "e1",
      sets: 3,
      reps: "8",
      rpe: "7",
      baseXp: 10,
    },
    {
      exerciseId: "e2",
      sets: 3,
      reps: "10",
      rpe: "6",
      baseXp: 10,
    },
  ],
});

describe("useWorkoutDraft", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with no draft source when no saved draft exists", () => {
    const { result } = renderHook(() =>
      useWorkoutDraft({ workout: createTestWorkout() }),
    );
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.draftSource).toBeNull();
  });

  it("startFresh creates a draft and persists it", () => {
    const { result } = renderHook(() =>
      useWorkoutDraft({ workout: createTestWorkout() }),
    );

    act(() => result.current.startFresh());

    expect(result.current.draftSource).toBe("fresh");
    expect(getDraft("w1")).not.toBeNull();
  });

  it("discardDraft clears the draft", () => {
    const { result } = renderHook(() =>
      useWorkoutDraft({ workout: createTestWorkout() }),
    );

    act(() => result.current.startFresh());
    act(() => result.current.discardDraft());

    expect(getDraft("w1")).toBeNull();
    expect(result.current.draftSource).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd client && npx vitest run src/__tests__/useWorkoutDraft.test.ts 2>&1 | tail -20`
Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/__tests__/useWorkoutDraft.test.ts
git commit -m "test: add useWorkoutDraft hook tests"
```

---

### Task 7.2: Server tests for idempotency

**Files:**
- Create: `server/__tests__/workoutLogIdempotency.test.js`

- [ ] **Step 1: Write failing test for idempotency check**

```javascript
// server/__tests__/workoutLogIdempotency.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { WorkoutLog } = require("../models/WorkoutLog");
const { Workout } = require("../models/Workout");
const { createWorkoutLog } = require("../services/workoutLogService");

let mongoServer;

const testUser = {
  _id: new mongoose.Types.ObjectId(),
  role: "user",
  level: 5,
  totalXp: 500,
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await WorkoutLog.deleteMany({});
  await Workout.deleteMany({});
});

const createTestWorkout = async () =>
  Workout.create({
    title: "Test Workout",
    requiredLevel: 1,
    exercises: [
      {
        exerciseId: new mongoose.Types.ObjectId(),
        sets: 3,
        reps: "8",
        rpe: "7",
        baseXp: 10,
      },
    ],
  });

describe("createWorkoutLog idempotency", () => {
  it("returns existing log on retry with same idempotencyKey", async () => {
    const workout = await createTestWorkout();
    const exerciseId = String(workout.exercises[0].exerciseId);
    const idempotencyKey = "test-key-abc123";
    const payload = {
      workoutId: workout._id,
      completedExercises: [
        { exerciseId, resultValue: 8, rpe: 7, metricType: "reps", unitLabel: "reps" },
        { exerciseId, resultValue: 7, rpe: 8, metricType: "reps", unitLabel: "reps" },
        { exerciseId, resultValue: 6, rpe: 9, metricType: "reps", unitLabel: "reps" },
      ],
    };

    // First submission — creates the log
    const first = await createWorkoutLog({
      user: testUser,
      userId: String(testUser._id),
      payload,
      idempotencyKey,
    });

    // Second submission with same key — returns existing log, no duplicate
    const second = await createWorkoutLog({
      user: testUser,
      userId: String(testUser._id),
      payload,
      idempotencyKey,
    });

    expect(second.workoutLog._id.toString()).toBe(first.workoutLog._id.toString());
    const count = await WorkoutLog.countDocuments({});
    expect(count).toBe(1);
  });

  it("creates two separate logs when idempotencyKey differs", async () => {
    const workout = await createTestWorkout();
    const exerciseId = String(workout.exercises[0].exerciseId);
    const payload = {
      workoutId: workout._id,
      completedExercises: [
        { exerciseId, resultValue: 8, rpe: 7, metricType: "reps", unitLabel: "reps" },
      ],
    };

    await createWorkoutLog({
      user: testUser,
      userId: String(testUser._id),
      payload,
      idempotencyKey: "key-1",
    });

    // Wait past the 60s dedup window by patching the date
    await WorkoutLog.updateMany({}, { $set: { date: new Date(Date.now() - 70 * 1000) } });

    await createWorkoutLog({
      user: testUser,
      userId: String(testUser._id),
      payload,
      idempotencyKey: "key-2",
    });

    const count = await WorkoutLog.countDocuments({});
    expect(count).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- --testPathPattern=workoutLogIdempotency 2>&1 | tail -20`
Expected: FAIL (idempotencyKey field not yet on model — will pass after Phase 6 is applied)

- [ ] **Step 3: Run all server tests**

Run: `cd server && npm test 2>&1 | tail -30`
Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add server/__tests__/workoutLogIdempotency.test.js
git commit -m "test: add server tests for idempotency key deduplication"
```

---

## Phase 8: QA Gates + Release Prep (Day 10)

### Task 8.1: Full build and lint gate

- [ ] **Step 1: Run client build**

Run: `cd client && npm run build 2>&1 | tail -20`
Expected: build succeeds

- [ ] **Step 2: Run client lint**

Run: `cd client && npm run lint 2>&1 | tail -20`
Expected: no errors

- [ ] **Step 3: Run all client tests**

Run: `cd client && npm test 2>&1 | tail -30`
Expected: all tests PASS

- [ ] **Step 4: Run all server tests**

Run: `cd server && npm test 2>&1 | tail -30`
Expected: all tests PASS

- [ ] **Step 5: Commit any fixes**

If any gate fails, fix and commit:

```bash
git add -A
git commit -m "fix: resolve QA gate issues"
```

---

### Task 8.2: Final regression checklist

- [ ] **Step 1: Verify existing workout completion flow still works**

Manual check: Start a workout, complete all exercises, verify celebration page and XP/achievement side effects.

- [ ] **Step 2: Verify draft persistence**

Manual check: Start a workout, enter some sets, refresh the page. Verify resume prompt appears and data is restored.

- [ ] **Step 3: Verify rest timer**

Manual check: Complete a set, verify timer starts. Change presets, verify persistence.

- [ ] **Step 4: Verify repeat-last-workout**

Manual check: Complete a workout, navigate back, start the same workout. Verify "Repeat last session" option appears and pre-fills correctly.

- [ ] **Step 5: Verify idempotency**

Manual check: Complete a workout, intercept the network request in DevTools. Replay the request — verify 200 (not 201) with same data.

- [ ] **Step 6: Tag release**

```bash
git tag -a v1.x.0 -m "feat: workout completion UX improvements"
```
