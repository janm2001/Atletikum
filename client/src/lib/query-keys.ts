export const keys = {
    exercises: {
        all: ['exercises'] as const,
        list: () => [...keys.exercises.all, 'list'] as const,
        detail: (id: string) => [...keys.exercises.all, 'detail', id] as const,
    },
    knowledgeBase: {
        all: ['articles'] as const,
        category: (cat: string) => [...keys.knowledgeBase.all, cat] as const,
        list: () => [...keys.knowledgeBase.all, 'list'] as const,
        detail: (id: string) => [...keys.knowledgeBase.all, 'detail', id] as const,
    }
}