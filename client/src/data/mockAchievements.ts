export interface Achievement {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    badgeUrl: string;
    unlockedAt?: Date;
    isUnlocked: boolean;
    category: "milestone" | "consistency" | "performance" | "special";
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: "first-steps",
        title: "Prvi koraci",
        description: "Završi svoju prvu vježbu",
        xpReward: 50,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=first-steps",
        unlockedAt: new Date("2024-01-15"),
        isUnlocked: true,
        category: "milestone",
    },
    {
        id: "week-warrior",
        title: "Ratnik tjedna",
        description: "Vježbaj 7 dana zaredom",
        xpReward: 200,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=week-warrior",
        unlockedAt: new Date("2024-02-01"),
        isUnlocked: true,
        category: "consistency",
    },
    {
        id: "centurion",
        title: "Stotnjak",
        description: "Sakupi 100 XP ukupno",
        xpReward: 100,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=centurion",
        unlockedAt: new Date("2024-02-10"),
        isUnlocked: true,
        category: "milestone",
    },
    {
        id: "consistency-king",
        title: "Kralj konzistencije",
        description: "Održi striku od 30 dana",
        xpReward: 500,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=consistency-king",
        isUnlocked: false,
        category: "consistency",
    },
    {
        id: "strength-master",
        title: "Gospodar snage",
        description: "Kompletan 10 vježbi sa fokusom na snagu",
        xpReward: 300,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=strength-master",
        isUnlocked: false,
        category: "performance",
    },
    {
        id: "mobility-guru",
        title: "Guru mobilnosti",
        description: "Kompletan 10 vježbi sa fokusom na mobilnost",
        xpReward: 300,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=mobility-guru",
        isUnlocked: false,
        category: "performance",
    },
    {
        id: "injury-preventer",
        title: "Sprječavač ozljeda",
        description: "Kompletan 5 vježbi za prevenciju ozljeda",
        xpReward: 250,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=injury-preventer",
        isUnlocked: false,
        category: "performance",
    },
    {
        id: "thousand-xp",
        title: "Tisućnjak",
        description: "Sakupi 1000 XP",
        xpReward: 250,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=thousand-xp",
        isUnlocked: false,
        category: "milestone",
    },
    {
        id: "legend",
        title: "Legenda",
        description: "Dostavi nivo 50",
        xpReward: 1000,
        badgeUrl: "https://api.dicebear.com/7.x/icons/svg?seed=legend",
        isUnlocked: false,
        category: "special",
    },
];
