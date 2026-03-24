export const keys = {
    exercises: {
        all: ['exercises'] as const,
        list: () => [...keys.exercises.all, 'list'] as const,
        detail: (id: string) => [...keys.exercises.all, 'detail', id] as const,
    },
    knowledgeBase: {
        all: ['articles'] as const,
        lists: () => [...keys.knowledgeBase.all, 'list'] as const,
        categories: (cats: string[]) => [...keys.knowledgeBase.lists(), 'categories', ...cats] as const,
        list: () => [...keys.knowledgeBase.lists(), 'all'] as const,
        saved: (cats: string[] = []) => [...keys.knowledgeBase.lists(), 'saved', ...cats] as const,
        search: (q: string) => [...keys.knowledgeBase.lists(), 'search', q] as const,
        details: () => [...keys.knowledgeBase.all, 'detail'] as const,
        detail: (id: string) => [...keys.knowledgeBase.details(), id] as const,
        bookmark: (id: string) => [...keys.knowledgeBase.all, 'bookmark', id] as const,
    },
    achievements: {
        all: ['achievements'] as const,
    },
    leaderboard: {
        all: ['leaderboard'] as const,
    },
    quiz: {
        all: ['quiz'] as const,
        status: (articleId: string) => [...keys.quiz.all, 'status', articleId] as const,
        completions: () => [...keys.quiz.all, 'completions'] as const,
        revision: () => [...keys.quiz.all, 'revision'] as const,
    },
    workouts: {
        all: ['workouts'] as const,
        lists: () => [...keys.workouts.all, 'list'] as const,
        list: (scope: string) => [...keys.workouts.lists(), scope] as const,
    },
    workoutLogs: {
        all: ['workout-logs'] as const,
        list: () => [...keys.workoutLogs.all, 'list'] as const,
        latest: (workoutId: string) => [...keys.workoutLogs.all, 'latest', workoutId] as const,
    },
    recommendations: {
        all: ['recommendations'] as const,
        weekly: () => [...keys.recommendations.all, 'weekly'] as const,
    },
    gamification: {
        all: ['gamification'] as const,
        status: () => [...keys.gamification.all, 'status'] as const,
    },
    challenges: {
        all: ['challenges'] as const,
        weekly: () => [...keys.challenges.all, 'weekly'] as const,
        history: (params?: Record<string, unknown>) => [...keys.challenges.all, 'history', params] as const,
        leaderboard: (params?: Record<string, unknown>) => [...keys.challenges.all, 'leaderboard', params] as const,
    },
    adminChallenges: {
        all: ['admin-challenges'] as const,
        templates: (params?: Record<string, unknown>) => [...keys.adminChallenges.all, 'templates', params] as const,
    },
}
