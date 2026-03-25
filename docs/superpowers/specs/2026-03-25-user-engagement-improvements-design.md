# User Engagement & Retention Improvements

**Date**: 2026-03-25  
**Status**: Approved for implementation  
**Goal**: Increase daily active users through structured training, spaced learning, and sustainable workout habits

---

## Problem Statement

Current user engagement issues:
1. **Workout spam** — Only 60-second duplicate protection; users can complete the same workout repeatedly without meaningful limits
2. **No training structure** — Users choose workouts ad-hoc with no weekly guidance
3. **Flat quiz cooldowns** — Fixed 3-day cooldown doesn't leverage spaced repetition for retention
4. **Limited content depth** — Only 5 articles; users exhaust educational content quickly
5. **No article progression** — All articles visible immediately without learning path guidance

---

## Solution Overview

| Feature | Description | Priority |
|---------|-------------|----------|
| Daily Workout Limit | Max 2 workouts per day | P1 |
| Weekly Training Plan | Flexible 3-4 session weekly framework | P1 |
| Spaced Repetition Quizzes | Exponential cooldown (3→7→14→30 days) | P2 |
| Article Difficulty Levels | Beginner/Intermediate/Advanced tags | P2 |
| Article Sequences | Suggested reading order within topics | P3 |

---

## Feature 1: Daily Workout Limit

### Overview

Prevent workout spamming by limiting users to 2 workouts per calendar day (UTC). This promotes rest, prevents gaming XP, and encourages quality over quantity.

### Data Model Changes

**User model** (`server/models/User.js`):
```javascript
dailyWorkoutLimit: { 
  type: Number, 
  default: 2, 
  min: 1, 
  max: 5 
}
```

**WorkoutLog model** (`server/models/WorkoutLog.js`):
```javascript
daySlot: { 
  type: Number, 
  min: 1, 
  max: 5 
}  // Which slot this workout fills (1 or 2 for default limit)
```

### Service Logic

**File**: `server/services/workoutLogService.js`

```javascript
// Add at top
const { startOfUtcDay, addUtcDays } = require("../utils/dateUtils");

// New helper function
const getTodayWorkoutCount = async ({ userId, session = null }) => {
  const todayStart = startOfUtcDay(new Date());
  const tomorrowStart = addUtcDays(todayStart, 1);
  
  return attachSession(
    WorkoutLog.countDocuments({
      user: userId,
      date: { $gte: todayStart, $lt: tomorrowStart }
    }),
    session
  );
};

// In createWorkoutLog, after duplicate check:
const todayCount = await getTodayWorkoutCount({ userId: normalizedUserId, session });
const userLimit = user.dailyWorkoutLimit ?? 2;

if (todayCount >= userLimit) {
  throw new AppError(
    `Dnevni limit treninga dosegnut (${userLimit}/${userLimit}). Nastavi sutra!`,
    429,
    { limitReached: true, todayCount, limit: userLimit }
  );
}

// Assign daySlot
const daySlot = todayCount + 1;
// Include daySlot in WorkoutLog creation
```

### API Response Enhancement

Add to workout log creation response:
```javascript
{
  // existing fields...
  dailyProgress: {
    completed: todayCount + 1,
    limit: userLimit,
    remainingToday: userLimit - (todayCount + 1)
  }
}
```

### Frontend Changes

**Dashboard** (`DashboardStatsGrid.tsx`):
- Add daily workout progress indicator: "Treninzi danas: 1/2"
- Use circular progress or slot indicators

**TrackWorkout submission**:
- On 429 response, show modal explaining the limit
- Suggest: "Nastavi sutra za novi streak bonus!"

**New celebration**:
- When reaching 2/2, show "Dnevni cilj ostvaren! 🎯" celebration

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Timezone gaming | Use UTC consistently; no client timezone |
| Admin testing | Admin role bypasses limit |
| Premium users | Future: allow configurable limit per user |

---

## Feature 2: Weekly Training Plan

### Overview

A flexible weekly framework showing users their training target and progress. Users set a weekly session goal (e.g., 3-4 sessions), system suggests which workouts to do, and tracks completion per day.

### Data Model

**New Model**: `server/models/WeeklyPlan.js`

```javascript
const mongoose = require("mongoose");

const suggestedWorkoutSchema = new mongoose.Schema({
  day: { type: Number, min: 1, max: 7, required: true },  // 1=Mon, 7=Sun
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
  reason: { type: String }  // Why this workout was suggested
}, { _id: false });

const weeklyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  weekStart: { type: Date, required: true },  // Monday 00:00 UTC
  weekEnd: { type: Date, required: true },    // Sunday 23:59 UTC
  targetSessions: { type: Number, default: 3, min: 1, max: 7 },
  completedDays: [{ type: Number, min: 1, max: 7 }],  // Days with logged workouts
  suggestedWorkouts: [suggestedWorkoutSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

weeklyPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

const WeeklyPlan = mongoose.model("WeeklyPlan", weeklyPlanSchema);
module.exports = { WeeklyPlan, weeklyPlanSchema };
```

### Service Logic

**New Service**: `server/services/weeklyPlanService.js`

Core functions:
- `getOrCreateWeeklyPlan({ userId })` — Get current week's plan or generate one
- `updatePlanProgress({ userId, workoutId })` — Called after workout log creation
- `generateSuggestedWorkouts({ user, weeklyPlan })` — Uses recommendation logic

```javascript
// NOTE: startOfIsoWeek and endOfIsoWeek already exist in weeklyChallengeService.js
// Import them from there, or move to dateUtils.js for shared use

const getOrCreateWeeklyPlan = async ({ userId, user }) => {
  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = endOfIsoWeek(weekStart);
  
  let plan = await WeeklyPlan.findOne({ userId, weekStart }).lean();
  
  if (!plan) {
    const targetSessions = user.trainingFrequency || 3;
    const suggestedWorkouts = await generateSuggestedWorkouts({ 
      user, 
      targetSessions,
      weekStart 
    });
    
    plan = await WeeklyPlan.create({
      userId,
      weekStart,
      weekEnd,
      targetSessions,
      completedDays: [],
      suggestedWorkouts
    });
  }
  
  return plan;
};
```

### Integration with WorkoutLog

In `workoutLogService.createWorkoutLog`, after successful creation:

```javascript
// Update weekly plan
const dayOfWeek = new Date().getUTCDay();
const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;  // Convert Sunday=0 to 7

await WeeklyPlan.findOneAndUpdate(
  { 
    userId: normalizedUserId, 
    weekStart: startOfIsoWeek(new Date()) 
  },
  { $addToSet: { completedDays: isoDay } }
);
```

### API Endpoints

**GET** `/api/v1/weekly-plan`
- Returns current week's plan with progress
- Response includes: targetSessions, completedDays, suggestedWorkouts, completionPercentage

**GET** `/api/v1/users/daily-progress`
- Returns today's workout count and limit
- Response: `{ completed: 1, limit: 2, remainingToday: 1 }`
- Frontend calls this before showing TrackWorkout page

### Frontend Components

**New Component**: `DashboardWeeklyPlan.tsx`

```
┌─────────────────────────────────────────────┐
│ Tjedni Plan                          3/4 ✓  │
├─────────────────────────────────────────────┤
│  Pon   Uto   Sri   Čet   Pet   Sub   Ned   │
│   ●     ○     ●     ◐     ○     ○     ○    │
│   ✓           ✓   danas                     │
├─────────────────────────────────────────────┤
│ Preporučeno: Razina 3: Snaga i Koordinacija │
│ 📊 Fokus na snazi, 2 dana odmora           │
└─────────────────────────────────────────────┘
```

Legend: ● completed, ○ not scheduled, ◐ today (suggested)

---

## Feature 3: Spaced Repetition Quiz Cooldowns

### Overview

Replace fixed 3-day cooldown with exponential backoff: 3 → 7 → 14 → 30 days. Users who score below 60% have their cooldown level reset, encouraging mastery.

### Data Model Changes

**QuizCooldown model** (`server/models/QuizCooldown.js`):

```javascript
const quizCooldownSchema = new mongoose.Schema({
  user: { type: String, required: true },
  article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
  nextAvailableAt: { type: Date, required: true },
  cooldownLevel: { type: Number, default: 1, min: 1, max: 4 },
  attemptCount: { type: Number, default: 0 },  // Incremented on each completion
  lastScore: { type: Number },
  lastPassed: { type: Boolean }
}, { timestamps: true });
```

### Cooldown Logic

**Constants** (`server/utils/quizTiming.js`):

```javascript
const COOLDOWN_SCHEDULE = {
  1: 3,   // 3 days
  2: 7,   // 7 days
  3: 14,  // 14 days
  4: 30   // 30 days
};

const MASTERY_THRESHOLD = 0.6;  // 60%

const getNextCooldownLevel = (currentLevel, passed) => {
  if (!passed && currentLevel > 1) {
    // Reset partially on failure
    return Math.max(1, currentLevel - 1);
  }
  if (passed) {
    return Math.min(4, currentLevel + 1);
  }
  return currentLevel;
};

const getCooldownDays = (level) => COOLDOWN_SCHEDULE[level] || 3;
```

### Service Changes

**File**: `server/services/quizService.js`

In `reserveQuizAttempt`:
```javascript
const existingCooldown = await QuizCooldown.findOne({ user: userId, article: articleId });
const currentLevel = existingCooldown?.cooldownLevel ?? 1;
const cooldownDays = getCooldownDays(currentLevel);
const nextAvailableAt = addUtcDays(now, cooldownDays);
```

In `submitQuiz`, after scoring:
```javascript
const passed = quizResult.score / quizResult.totalQuestions >= MASTERY_THRESHOLD;
const newLevel = getNextCooldownLevel(currentLevel, passed);

await QuizCooldown.findOneAndUpdate(
  { user: userId, article: articleId },
  { 
    $set: { 
      cooldownLevel: newLevel,
      lastScore: quizResult.score,
      lastPassed: passed
    },
    $inc: { attemptCount: 1 }
  }
);
```

### XP Adjustment

```javascript
// In quizScoring.js
const getXpMultiplier = (attemptNumber) => {
  if (attemptNumber === 1) return 1.0;      // Full XP first time
  if (attemptNumber <= 3) return 0.5;       // 50% XP for review
  return 0.25;                              // 25% XP after many attempts
};
```

### Frontend Changes

**Quiz locked state** (`QuizLockedState.tsx`):

Change from:
```
"Kviz možete ponoviti nakon [date]"
```

To:
```
"Kviz možete ponoviti za 7 dana"
"Razina ponavljanja: 2/4"
[Progress bar showing mastery level]
```

**Quiz completion** (`QuizResultFeedback.tsx`):

Add spaced repetition info:
```
"Odlično! Iduće ponavljanje za 7 dana."
"Savjet: Razmišljaj o ovoj temi tijekom tjedna za bolje pamćenje."
```

---

## Feature 4: Article Difficulty Levels

### Overview

Tag articles with difficulty (beginner/intermediate/advanced) to guide users toward appropriate content based on their level.

### Data Model Changes

**Article model** (`server/models/Article.js`):

```javascript
difficulty: {
  type: String,
  enum: ['beginner', 'intermediate', 'advanced'],
  default: 'beginner',
  index: true
},
sequenceGroup: {
  type: String,
  index: true
},
sequenceOrder: {
  type: Number,
  default: 0
},
prerequisites: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Article'
}]
// Note: prerequisites are used for soft suggestions only (see Feature 5)
// UI shows "Preporučamo prvo pročitati: [Article X]" but doesn't block access
```

### Difficulty → Level Mapping

| Difficulty | Suggested User Level |
|------------|---------------------|
| Beginner | 1-4 |
| Intermediate | 5-8 |
| Advanced | 9+ |

### Migration for Existing Articles

Run a one-time migration script to set defaults for existing articles:

```javascript
// server/migrations/addArticleDifficultyDefaults.js
await Article.updateMany(
  { difficulty: { $exists: false } },
  { $set: { difficulty: 'beginner', sequenceOrder: 0 } }
);
```

### Service Changes

**File**: `server/services/recommendationService.js`

```javascript
const getDifficultyForLevel = (level) => {
  if (level <= 4) return ['beginner', 'intermediate'];
  if (level <= 8) return ['beginner', 'intermediate', 'advanced'];
  return ['intermediate', 'advanced'];
};

// In getWeeklyRecommendations:
const appropriateDifficulties = getDifficultyForLevel(user.level);

const recommendedArticles = await Article.find({
  tag: { $in: focusConfig.articleTags },
  difficulty: { $in: appropriateDifficulties },
  _id: { $nin: [...completedArticleIds] }
})
.sort({ sequenceOrder: 1, createdAt: -1 })
.limit(3);
```

### Frontend Changes

**Article card** (`ArticleCard.tsx`):

Add difficulty badge:
```jsx
<Badge 
  color={difficulty === 'beginner' ? 'green' : difficulty === 'intermediate' ? 'yellow' : 'red'}
>
  {t(`article.difficulty.${difficulty}`)}
</Badge>
```

**Knowledge Base** (`KnowledgeBase.tsx`):

Add difficulty filter dropdown:
```jsx
<Select
  label={t('knowledgeBase.filterDifficulty')}
  data={[
    { value: 'all', label: t('knowledgeBase.allDifficulties') },
    { value: 'beginner', label: t('article.difficulty.beginner') },
    { value: 'intermediate', label: t('article.difficulty.intermediate') },
    { value: 'advanced', label: t('article.difficulty.advanced') }
  ]}
/>
```

---

## Feature 5: Article Sequences

### Overview

Soft suggestion for reading order within topic groups. Articles in the same `sequenceGroup` are shown in order, with "Next in sequence" prompts.

### Logic

```javascript
// In articleService.js
const getNextInSequence = async (article) => {
  if (!article.sequenceGroup) return null;
  
  return Article.findOne({
    sequenceGroup: article.sequenceGroup,
    sequenceOrder: { $gt: article.sequenceOrder }
  })
  .sort({ sequenceOrder: 1 })
  .select('_id title summary')
  .lean();
};
```

### Frontend Changes

**Article detail** (`ArticleDetail.tsx`):

At article end:
```jsx
{nextInSequence && (
  <Card>
    <Text size="sm" c="dimmed">{t('article.nextInSequence')}</Text>
    <Group>
      <Text fw={500}>{nextInSequence.title}</Text>
      <Button onClick={() => navigate(`/edukacija/${nextInSequence._id}`)}>
        {t('article.continueReading')}
      </Button>
    </Group>
  </Card>
)}
```

---

## Implementation Priority

### Phase 1 (Week 1-2): Core Engagement
1. Daily workout limit
2. Weekly training plan model + basic UI

### Phase 2 (Week 2-3): Learning Improvements
3. Spaced repetition quiz cooldowns
4. Article difficulty levels

### Phase 3 (Week 3-4): Polish
5. Article sequences
6. Enhanced UI/UX for all features
7. Content expansion (more articles)

---

## Testing Strategy

### Unit Tests

| Area | Test Cases |
|------|------------|
| Daily limit | Limit enforcement, edge cases (midnight), admin bypass |
| Weekly plan | Plan generation, progress tracking, week rollover |
| Spaced repetition | Cooldown level transitions, XP multipliers, reset on failure |
| Article difficulty | Level mapping, filter queries |

### Integration Tests

- End-to-end workout submission with limit check
- Weekly plan creation and workout integration
- Quiz submission with cooldown level update

### Manual QA

- Verify UI shows correct daily progress
- Verify weekly plan renders correctly
- Verify quiz cooldown messaging

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Daily active users | Baseline | +20% |
| Avg sessions per week | Baseline | 3-4 |
| Quiz retry rate | Baseline | +30% |
| Article completion rate | Baseline | +25% |

---

## Appendix: Translation Keys

```json
{
  "training": {
    "dailyProgress": "Treninzi danas",
    "dailyLimitReached": "Dnevni limit treninga dosegnut",
    "continueTomorrow": "Nastavi sutra!"
  },
  "weeklyPlan": {
    "title": "Tjedni Plan",
    "sessionsCompleted": "{{completed}}/{{target}} odrađeno",
    "recommended": "Preporučeno",
    "days": {
      "1": "Pon",
      "2": "Uto",
      "3": "Sri",
      "4": "Čet",
      "5": "Pet",
      "6": "Sub",
      "7": "Ned"
    }
  },
  "quiz": {
    "spacedRepetition": {
      "nextIn": "Iduće ponavljanje za {{days}} dana",
      "masteryLevel": "Razina ponavljanja",
      "masteryTip": "Razmišljaj o ovoj temi tijekom tjedna za bolje pamćenje"
    }
  },
  "article": {
    "difficulty": {
      "beginner": "Početnik",
      "intermediate": "Srednji",
      "advanced": "Napredni"
    },
    "nextInSequence": "Sljedeće u nizu",
    "continueReading": "Nastavi čitati"
  }
}
```
