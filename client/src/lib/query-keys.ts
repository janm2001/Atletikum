export const keys = {
    exercises: {
        all: ['exercises'] as const,
        list: () => [...keys.exercises.all, 'list'] as const,
        detail: (id: string) => [...keys.exercises.all, 'detail', id] as const,
    },
    knowledgeBase: {
        all: ['articles'] as const,
        categories: (cats: string[]) => [...keys.knowledgeBase.all, 'categories', ...cats] as const,
        list: () => [...keys.knowledgeBase.all, 'list'] as const,
        detail: (id: string) => [...keys.knowledgeBase.all, 'detail', id] as const,
        saved: () => [...keys.knowledgeBase.all, 'saved'] as const,
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
    },
    workoutLogs: {
        all: ['workout-logs'] as const,
    },
    recommendations: {
        all: ['recommendations'] as const,
        weekly: () => [...keys.recommendations.all, 'weekly'] as const,
    },
}