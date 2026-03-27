# User Engagement Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add daily workout limits, weekly training plans, spaced repetition quizzes, and article difficulty levels to increase user retention.

**Architecture:** Backend-first approach with model changes, service logic, API endpoints, then frontend components. Each feature is independent and can be shipped incrementally.

**Tech Stack:** Node.js/Express, MongoDB/Mongoose, React 19, TypeScript, Mantine UI, TanStack Query

**Spec Document:** `docs/superpowers/specs/2026-03-25-user-engagement-improvements-design.md`

---

## File Structure

### Backend - New Files
| File | Purpose |
|------|---------|
| `server/models/WeeklyPlan.js` | Weekly training plan schema |
| `server/services/weeklyPlanService.js` | Weekly plan CRUD and generation |
| `server/services/dailyLimitService.js` | Daily workout limit checking |
| `server/controllers/weeklyPlanController.js` | Weekly plan API handlers |
| `server/routes/weeklyPlanRoutes.js` | Weekly plan route definitions |
| `server/__tests__/dailyLimitService.test.js` | Daily limit unit tests |
| `server/__tests__/weeklyPlanService.test.js` | Weekly plan unit tests |
| `server/__tests__/spacedRepetitionQuiz.test.js` | Spaced rep quiz tests |

### Backend - Modified Files
| File | Changes |
|------|---------|
| `server/models/User.js` | Add `dailyWorkoutLimit` field |
| `server/models/WorkoutLog.js` | Add `daySlot` field |
| `server/models/Article.js` | Add `difficulty`, `sequenceGroup`, `sequenceOrder` fields |
| `server/models/QuizCooldown.js` | Add `cooldownLevel`, `attemptCount`, `lastScore` fields |
| `server/services/workoutLogService.js` | Integrate daily limit check |
| `server/services/quizService.js` | Implement spaced repetition logic |
| `server/services/recommendationService.js` | Factor in difficulty levels |
| `server/utils/dateUtils.js` | Add `startOfIsoWeek`, `endOfIsoWeek` |
| `server/utils/quizTiming.js` | Add cooldown schedule constants |
| `server/index.js` | Mount weekly plan routes |

### Frontend - New Files
| File | Purpose |
|------|---------|
| `client/src/api/weeklyPlanApi.ts` | Weekly plan API calls |
| `client/src/hooks/useWeeklyPlan.ts` | TanStack Query hook |
| `client/src/hooks/useDailyProgress.ts` | Daily workout progress hook |
| `client/src/types/WeeklyPlan/weeklyPlan.ts` | TypeScript types |
| `client/src/components/Dashboard/DashboardWeeklyPlan/DashboardWeeklyPlan.tsx` | Weekly plan card |
| `client/src/components/Dashboard/DashboardWeeklyPlan/DashboardWeeklyPlan.module.css` | Styles |
| `client/src/components/Dashboard/DashboardDailyProgress/DashboardDailyProgress.tsx` | Daily limit indicator |
| `client/src/components/Dashboard/DashboardDailyProgress/DashboardDailyProgress.module.css` | Styles |

### Frontend - Modified Files
| File | Changes |
|------|---------|
| `client/src/pages/Dashboard/Dashboard.tsx` | Add weekly plan + daily progress |
| `client/src/components/KnowledgeBase/ArticleCard/ArticleCard.tsx` | Add difficulty badge |
| `client/src/components/KnowledgeBase/Quiz/QuizLockedState.tsx` | Show spaced rep level |
| `client/src/i18n/locales/hr.json` | New translation keys |

---

## Chunk 1: Daily Workout Limit Backend

### Task 1.1: Add Daily Limit Fields to Models

**Files:**
- Modify: `server/models/User.js:36-42`
- Modify: `server/models/WorkoutLog.js:31-33`

- [ ] **Step 1: Add dailyWorkoutLimit to User model**

Open `server/models/User.js` and add after line 41 (`longestStreak`):

```javascript
dailyWorkoutLimit: { type: Number, default: 2, min: 1, max: 5 },
```

- [ ] **Step 2: Add daySlot to WorkoutLog model**

Open `server/models/WorkoutLog.js` and add after line 31 (`idempotencyKey`):

```javascript
daySlot: { type: Number, min: 1, max: 5 },
```

- [ ] **Step 3: Verify models load without errors**

Run: `cd server && node -e "require('./models/User'); require('./models/WorkoutLog'); console.log('Models OK')"`

Expected: `Models OK`

- [ ] **Step 4: Commit**

```bash
git add server/models/User.js server/models/WorkoutLog.js
git commit -m "feat(models): add dailyWorkoutLimit and daySlot fields

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 1.2: Add ISO Week Utilities to dateUtils

**Files:**
- Modify: `server/utils/dateUtils.js`
- Create: `server/__tests__/dateUtils.test.js`

- [ ] **Step 1: Write failing tests for ISO week functions**

Create `server/__tests__/dateUtils.test.js`:

```javascript
const {
  startOfIsoWeek,
  endOfIsoWeek,
  getIsoWeekDay,
} = require("../utils/dateUtils");

describe("ISO Week Utilities", () => {
  describe("startOfIsoWeek", () => {
    it("returns Monday 00:00 UTC for a Wednesday", () => {
      const wed = new Date("2026-03-25T14:30:00Z"); // Wednesday
      const result = startOfIsoWeek(wed);
      expect(result.toISOString()).toBe("2026-03-23T00:00:00.000Z"); // Monday
    });

    it("returns same Monday for a Monday", () => {
      const mon = new Date("2026-03-23T10:00:00Z");
      const result = startOfIsoWeek(mon);
      expect(result.toISOString()).toBe("2026-03-23T00:00:00.000Z");
    });

    it("returns previous Monday for a Sunday", () => {
      const sun = new Date("2026-03-29T23:59:59Z");
      const result = startOfIsoWeek(sun);
      expect(result.toISOString()).toBe("2026-03-23T00:00:00.000Z");
    });
  });

  describe("endOfIsoWeek", () => {
    it("returns Sunday 23:59:59.999 UTC for week start", () => {
      const weekStart = new Date("2026-03-23T00:00:00Z");
      const result = endOfIsoWeek(weekStart);
      expect(result.toISOString()).toBe("2026-03-29T23:59:59.999Z");
    });
  });

  describe("getIsoWeekDay", () => {
    it("returns 1 for Monday", () => {
      const mon = new Date("2026-03-23T00:00:00Z");
      expect(getIsoWeekDay(mon)).toBe(1);
    });

    it("returns 7 for Sunday", () => {
      const sun = new Date("2026-03-29T00:00:00Z");
      expect(getIsoWeekDay(sun)).toBe(7);
    });

    it("returns 3 for Wednesday", () => {
      const wed = new Date("2026-03-25T00:00:00Z");
      expect(getIsoWeekDay(wed)).toBe(3);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- --testPathPattern=dateUtils`

Expected: FAIL (functions not defined)

- [ ] **Step 3: Implement ISO week functions**

Add to `server/utils/dateUtils.js` before `module.exports`:

```javascript
const startOfIsoWeek = (value = new Date()) => {
  const date = new Date(value);
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const endOfIsoWeek = (weekStart) => {
  const date = new Date(weekStart);
  date.setUTCDate(date.getUTCDate() + 6);
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

const getIsoWeekDay = (value = new Date()) => {
  const day = new Date(value).getUTCDay();
  return day === 0 ? 7 : day;
};
```

Update `module.exports`:

```javascript
module.exports = {
  DAY_IN_MILLISECONDS,
  addUtcDays,
  endOfIsoWeek,
  getIsoWeekDay,
  getUtcDayDifference,
  startOfIsoWeek,
  startOfUtcDay,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=dateUtils`

Expected: PASS (3 test suites)

- [ ] **Step 5: Commit**

```bash
git add server/utils/dateUtils.js server/__tests__/dateUtils.test.js
git commit -m "feat(utils): add ISO week utility functions

- startOfIsoWeek: get Monday 00:00 UTC
- endOfIsoWeek: get Sunday 23:59:59 UTC
- getIsoWeekDay: get 1-7 (Mon-Sun)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 1.3: Create Daily Limit Service

**Files:**
- Create: `server/services/dailyLimitService.js`
- Create: `server/__tests__/dailyLimitService.test.js`

- [ ] **Step 1: Write failing tests**

Create `server/__tests__/dailyLimitService.test.js`:

```javascript
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { WorkoutLog } = require("../models/WorkoutLog");
const {
  getTodayWorkoutCount,
  checkDailyLimit,
  DailyLimitExceededError,
} = require("../services/dailyLimitService");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await WorkoutLog.deleteMany({});
});

describe("dailyLimitService", () => {
  const userId = "test-user-123";
  const workoutId = new mongoose.Types.ObjectId();

  describe("getTodayWorkoutCount", () => {
    it("returns 0 when no workouts today", async () => {
      const count = await getTodayWorkoutCount({ userId });
      expect(count).toBe(0);
    });

    it("returns correct count for workouts today", async () => {
      await WorkoutLog.create({ user: userId, workoutId, workout: "Test" });
      await WorkoutLog.create({ user: userId, workoutId, workout: "Test2" });

      const count = await getTodayWorkoutCount({ userId });
      expect(count).toBe(2);
    });

    it("excludes workouts from yesterday", async () => {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      await WorkoutLog.create({
        user: userId,
        workoutId,
        workout: "Yesterday",
        date: yesterday,
      });
      await WorkoutLog.create({ user: userId, workoutId, workout: "Today" });

      const count = await getTodayWorkoutCount({ userId });
      expect(count).toBe(1);
    });
  });

  describe("checkDailyLimit", () => {
    it("returns canProceed: true when under limit", async () => {
      const result = await checkDailyLimit({ userId, limit: 2 });
      expect(result.canProceed).toBe(true);
      expect(result.todayCount).toBe(0);
      expect(result.nextSlot).toBe(1);
    });

    it("returns canProceed: false when at limit", async () => {
      await WorkoutLog.create({ user: userId, workoutId, workout: "W1" });
      await WorkoutLog.create({ user: userId, workoutId, workout: "W2" });

      const result = await checkDailyLimit({ userId, limit: 2 });
      expect(result.canProceed).toBe(false);
      expect(result.todayCount).toBe(2);
    });

    it("throws DailyLimitExceededError with throwOnExceeded: true", async () => {
      await WorkoutLog.create({ user: userId, workoutId, workout: "W1" });
      await WorkoutLog.create({ user: userId, workoutId, workout: "W2" });

      await expect(
        checkDailyLimit({ userId, limit: 2, throwOnExceeded: true })
      ).rejects.toThrow(DailyLimitExceededError);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- --testPathPattern=dailyLimitService`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement daily limit service**

Create `server/services/dailyLimitService.js`:

```javascript
const { WorkoutLog } = require("../models/WorkoutLog");
const { startOfUtcDay, addUtcDays } = require("../utils/dateUtils");
const { attachSession } = require("../utils/mongoTransaction");
const AppError = require("../utils/AppError");

class DailyLimitExceededError extends AppError {
  constructor(todayCount, limit) {
    super(
      `Dnevni limit treninga dosegnut (${todayCount}/${limit}). Nastavi sutra!`,
      429,
      { limitReached: true, todayCount, limit }
    );
    this.name = "DailyLimitExceededError";
  }
}

const getTodayWorkoutCount = async ({ userId, session = null }) => {
  const todayStart = startOfUtcDay(new Date());
  const tomorrowStart = addUtcDays(todayStart, 1);

  const query = WorkoutLog.countDocuments({
    user: userId,
    date: { $gte: todayStart, $lt: tomorrowStart },
  });

  return attachSession(query, session);
};

const checkDailyLimit = async ({
  userId,
  limit,
  session = null,
  throwOnExceeded = false,
}) => {
  const todayCount = await getTodayWorkoutCount({ userId, session });
  const canProceed = todayCount < limit;
  const nextSlot = todayCount + 1;

  if (!canProceed && throwOnExceeded) {
    throw new DailyLimitExceededError(todayCount, limit);
  }

  return {
    canProceed,
    todayCount,
    limit,
    nextSlot,
    remainingToday: Math.max(0, limit - todayCount),
  };
};

module.exports = {
  DailyLimitExceededError,
  getTodayWorkoutCount,
  checkDailyLimit,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=dailyLimitService`

Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add server/services/dailyLimitService.js server/__tests__/dailyLimitService.test.js
git commit -m "feat(services): add daily workout limit service

- getTodayWorkoutCount: count workouts since midnight UTC
- checkDailyLimit: check if user can proceed
- DailyLimitExceededError: custom 429 error

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 1.4: Integrate Daily Limit into WorkoutLogService

**Files:**
- Modify: `server/services/workoutLogService.js`

- [ ] **Step 1: Add daily limit check to createWorkoutLog**

Open `server/services/workoutLogService.js`.

Add import at top:

```javascript
const { checkDailyLimit } = require("./dailyLimitService");
```

In `createWorkoutLog`, after the duplicate check (around line 98), add:

```javascript
// Check daily workout limit
const userLimit = user.dailyWorkoutLimit ?? 2;
const dailyCheck = await checkDailyLimit({
  userId: normalizedUserId,
  limit: userLimit,
  session,
  throwOnExceeded: true,
});
```

In the WorkoutLog creation (around line 153), add `daySlot`:

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
    daySlot: dailyCheck.nextSlot,
    ...(idempotencyKey ? { idempotencyKey } : {}),
  },
  session,
);
```

Update return statement to include daily progress:

```javascript
return {
  workoutLog,
  user: progress.user,
  newAchievements: progress.newAchievements,
  totalXpGained: xpGain,
  personalBests: completedWithPersonalBests.filter(
    (exercise) => exercise.isPersonalBest,
  ),
  dailyProgress: {
    completed: dailyCheck.nextSlot,
    limit: userLimit,
    remainingToday: userLimit - dailyCheck.nextSlot,
  },
};
```

- [ ] **Step 2: Run existing tests**

Run: `cd server && npm test -- --testPathPattern=workoutLog`

Expected: PASS (existing tests should still work)

- [ ] **Step 3: Run full test suite**

Run: `cd server && npm test`

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add server/services/workoutLogService.js
git commit -m "feat(workoutLog): integrate daily workout limit check

- Check limit before creating log
- Assign daySlot (1 or 2)
- Return dailyProgress in response

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 1.5: Add Daily Progress API Endpoint

**Files:**
- Modify: `server/routes/workoutLogRoutes.js`
- Modify: `server/controllers/workoutLogController.js`

- [ ] **Step 1: Add controller function**

Open `server/controllers/workoutLogController.js` and add:

```javascript
const { checkDailyLimit } = require("../services/dailyLimitService");

const getDailyProgress = async (req, res) => {
  const userId = req.user._id.toString();
  const limit = req.user.dailyWorkoutLimit ?? 2;

  const progress = await checkDailyLimit({ userId, limit });

  res.json({
    completed: progress.todayCount,
    limit: progress.limit,
    remainingToday: progress.remainingToday,
    canProceed: progress.canProceed,
  });
};
```

Add to exports.

- [ ] **Step 2: Add route**

Open `server/routes/workoutLogRoutes.js` and add:

```javascript
router.get("/daily-progress", authMiddleware, getDailyProgress);
```

- [ ] **Step 3: Commit**

```bash
git add server/routes/workoutLogRoutes.js server/controllers/workoutLogController.js
git commit -m "feat(api): add GET /workout-logs/daily-progress endpoint

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Chunk 2: Spaced Repetition Quiz Cooldowns

### Task 2.1: Update QuizCooldown Model

**Files:**
- Modify: `server/models/QuizCooldown.js`

- [ ] **Step 1: Add new fields to schema**

Open `server/models/QuizCooldown.js` and update the schema:

```javascript
const quizCooldownSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    nextAvailableAt: {
      type: Date,
      required: true,
    },
    cooldownLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    lastScore: {
      type: Number,
      default: null,
    },
    lastPassed: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true },
);
```

- [ ] **Step 2: Verify model loads**

Run: `cd server && node -e "require('./models/QuizCooldown'); console.log('OK')"`

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add server/models/QuizCooldown.js
git commit -m "feat(models): add spaced repetition fields to QuizCooldown

- cooldownLevel: 1-4 for exponential backoff
- attemptCount: track total attempts
- lastScore, lastPassed: for reset logic

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2.2: Add Spaced Repetition Constants

**Files:**
- Modify: `server/utils/quizTiming.js`
- Create: `server/__tests__/spacedRepetitionQuiz.test.js`

- [ ] **Step 1: Write failing tests**

Create `server/__tests__/spacedRepetitionQuiz.test.js`:

```javascript
const {
  COOLDOWN_SCHEDULE,
  MASTERY_THRESHOLD,
  getCooldownDays,
  getNextCooldownLevel,
  getXpMultiplier,
} = require("../utils/quizTiming");

describe("Spaced Repetition Quiz Timing", () => {
  describe("getCooldownDays", () => {
    it("returns 3 days for level 1", () => {
      expect(getCooldownDays(1)).toBe(3);
    });

    it("returns 7 days for level 2", () => {
      expect(getCooldownDays(2)).toBe(7);
    });

    it("returns 14 days for level 3", () => {
      expect(getCooldownDays(3)).toBe(14);
    });

    it("returns 30 days for level 4", () => {
      expect(getCooldownDays(4)).toBe(30);
    });

    it("returns 3 days for invalid level", () => {
      expect(getCooldownDays(0)).toBe(3);
      expect(getCooldownDays(5)).toBe(3);
    });
  });

  describe("getNextCooldownLevel", () => {
    it("increases level on pass", () => {
      expect(getNextCooldownLevel(1, true)).toBe(2);
      expect(getNextCooldownLevel(2, true)).toBe(3);
      expect(getNextCooldownLevel(3, true)).toBe(4);
    });

    it("caps at level 4", () => {
      expect(getNextCooldownLevel(4, true)).toBe(4);
    });

    it("decreases level on fail (if level > 1)", () => {
      expect(getNextCooldownLevel(3, false)).toBe(2);
      expect(getNextCooldownLevel(2, false)).toBe(1);
    });

    it("stays at level 1 on fail", () => {
      expect(getNextCooldownLevel(1, false)).toBe(1);
    });
  });

  describe("getXpMultiplier", () => {
    it("returns 1.0 for first attempt", () => {
      expect(getXpMultiplier(1)).toBe(1.0);
    });

    it("returns 0.5 for attempts 2-3", () => {
      expect(getXpMultiplier(2)).toBe(0.5);
      expect(getXpMultiplier(3)).toBe(0.5);
    });

    it("returns 0.25 for attempts 4+", () => {
      expect(getXpMultiplier(4)).toBe(0.25);
      expect(getXpMultiplier(10)).toBe(0.25);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- --testPathPattern=spacedRepetition`

Expected: FAIL

- [ ] **Step 3: Implement spaced repetition functions**

Open `server/utils/quizTiming.js` and add:

```javascript
const COOLDOWN_SCHEDULE = {
  1: 3,
  2: 7,
  3: 14,
  4: 30,
};

const MASTERY_THRESHOLD = 0.6;

const getCooldownDays = (level) => COOLDOWN_SCHEDULE[level] ?? 3;

const getNextCooldownLevel = (currentLevel, passed) => {
  if (passed) {
    return Math.min(4, currentLevel + 1);
  }
  if (currentLevel > 1) {
    return currentLevel - 1;
  }
  return 1;
};

const getXpMultiplier = (attemptNumber) => {
  if (attemptNumber === 1) return 1.0;
  if (attemptNumber <= 3) return 0.5;
  return 0.25;
};
```

Update `module.exports` to include new exports.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test -- --testPathPattern=spacedRepetition`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/utils/quizTiming.js server/__tests__/spacedRepetitionQuiz.test.js
git commit -m "feat(quiz): add spaced repetition timing functions

- COOLDOWN_SCHEDULE: 3→7→14→30 days
- getNextCooldownLevel: increase on pass, decrease on fail
- getXpMultiplier: diminishing returns for retries

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2.3: Update Quiz Service for Spaced Repetition

**Files:**
- Modify: `server/services/quizService.js`

- [ ] **Step 1: Update imports and integrate spaced rep logic**

This task requires careful modification of `reserveQuizAttempt` and `submitQuiz` functions to use the new cooldown schedule. See spec for full details.

- [ ] **Step 2: Run tests**

Run: `cd server && npm test`

Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add server/services/quizService.js
git commit -m "feat(quiz): implement spaced repetition cooldowns

- Exponential backoff: 3→7→14→30 days
- Level increases on pass, decreases on fail
- XP multiplier: 100%→50%→25% for retries

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Chunk 3: Article Difficulty Levels

### Task 3.1: Update Article Model

**Files:**
- Modify: `server/models/Article.js`

- [ ] **Step 1: Add difficulty fields to schema**

Add after `author` field:

```javascript
difficulty: {
  type: String,
  enum: ["beginner", "intermediate", "advanced"],
  default: "beginner",
  index: true,
},
sequenceGroup: {
  type: String,
  default: null,
  index: true,
},
sequenceOrder: {
  type: Number,
  default: 0,
},
```

- [ ] **Step 2: Verify model loads**

Run: `cd server && node -e "require('./models/Article'); console.log('OK')"`

- [ ] **Step 3: Commit**

```bash
git add server/models/Article.js
git commit -m "feat(models): add difficulty and sequence fields to Article

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3.2: Update Recommendation Service

**Files:**
- Modify: `server/services/recommendationService.js`

- [ ] **Step 1: Add difficulty mapping and update queries**

Add `getDifficultiesForLevel` function and update article recommendation query.

- [ ] **Step 2: Run tests and commit**

---

### Task 3.3: Create Migration Script

**Files:**
- Create: `server/migrations/addArticleDifficultyDefaults.js`

- [ ] **Step 1: Create and run migration**

---

## Chunk 4: Weekly Training Plan

### Task 4.1: Create WeeklyPlan Model

**Files:**
- Create: `server/models/WeeklyPlan.js`

- [ ] **Step 1: Create model with schema from spec**

---

### Task 4.2: Create WeeklyPlan Service

**Files:**
- Create: `server/services/weeklyPlanService.js`
- Create: `server/__tests__/weeklyPlanService.test.js`

- [ ] **Step 1: Write tests, implement service**

---

### Task 4.3: Create API Routes

**Files:**
- Create: `server/controllers/weeklyPlanController.js`
- Create: `server/routes/weeklyPlanRoutes.js`
- Modify: `server/index.js`

---

### Task 4.4: Integrate with Workout Log

**Files:**
- Modify: `server/services/workoutLogService.js`

---

## Chunk 5: Frontend Implementation

### Task 5.1: Add TypeScript Types

**Files:**
- Create: `client/src/types/WeeklyPlan/weeklyPlan.ts`

---

### Task 5.2: Add API and Hooks

**Files:**
- Create: `client/src/api/weeklyPlanApi.ts`
- Create: `client/src/hooks/useWeeklyPlan.ts`
- Create: `client/src/hooks/useDailyProgress.ts`

---

### Task 5.3: Create Dashboard Components

**Files:**
- Create: `client/src/components/Dashboard/DashboardWeeklyPlan/`
- Create: `client/src/components/Dashboard/DashboardDailyProgress/`

---

### Task 5.4: Integrate into Dashboard

**Files:**
- Modify: `client/src/pages/Dashboard/Dashboard.tsx`

---

### Task 5.5: Add Translations

**Files:**
- Modify: `client/src/i18n/locales/hr.json`

---

### Task 5.6: Update Quiz Locked State

**Files:**
- Modify: `client/src/components/KnowledgeBase/Quiz/QuizLockedState.tsx`

---

### Task 5.7: Add Article Difficulty Badge

**Files:**
- Modify: `client/src/components/KnowledgeBase/ArticleCard/ArticleCard.tsx`

---

## Chunk 6: Final Verification

### Task 6.1: Run Full Test Suite

- [ ] **Step 1: Backend tests**: `cd server && npm test`
- [ ] **Step 2: Frontend tests**: `cd client && npm run test`
- [ ] **Step 3: Frontend build**: `cd client && npm run build`
- [ ] **Step 4: Lint**: `cd client && npm run lint`

### Task 6.2: Manual Smoke Test

- [ ] Test daily limit (complete 2 workouts, attempt 3rd)
- [ ] Test weekly plan (verify UI updates)
- [ ] Test quiz spaced repetition (verify cooldown progression)

---

## Summary

| Chunk | Features | Est. Time |
|-------|----------|-----------|
| 1 | Daily workout limit (backend) | 45 min |
| 2 | Spaced repetition quizzes | 30 min |
| 3 | Article difficulty levels | 20 min |
| 4 | Weekly training plan | 45 min |
| 5 | Frontend components | 60 min |
| 6 | Verification | 20 min |

**Total estimated time: ~4 hours**

Each chunk produces working, tested code that can be shipped independently.
