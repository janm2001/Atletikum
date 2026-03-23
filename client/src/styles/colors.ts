export const colors = {
    primary: {
        main: "#667eea",
        dark: "#764ba2",
        light: "#8b9cff",
    },

    interactive: {
        hover: "rgba(102, 126, 234, 0.15)",
        active: "rgba(102, 126, 234, 0.25)",
        focus: "rgba(102, 126, 234, 0.3)",
    },

    semantic: {
        success: "#51cf66",
        warning: "#ffd43b",
        error: "#ff6b6b",
        info: "#4dabf7",
    },

    leaderboard: {
        gold: {
            base: "#E0B13A",
            bgLight: "rgba(224, 177, 58, 0.14)",
            bgDark: "rgba(224, 177, 58, 0.2)",
            borderLight: "rgba(224, 177, 58, 0.3)",
            borderDark: "rgba(224, 177, 58, 0.42)",
        },
        silver: {
            base: "#A8B5C7",
            bgLight: "rgba(168, 181, 199, 0.14)",
            bgDark: "rgba(168, 181, 199, 0.2)",
            borderLight: "rgba(168, 181, 199, 0.32)",
            borderDark: "rgba(168, 181, 199, 0.44)",
        },
        bronze: {
            base: "#C68753",
            bgLight: "rgba(198, 135, 83, 0.14)",
            bgDark: "rgba(198, 135, 83, 0.2)",
            borderLight: "rgba(198, 135, 83, 0.34)",
            borderDark: "rgba(198, 135, 83, 0.46)",
        },
        fallbackRank: {
            bgLight: "rgba(145, 89, 240, 0.12)",
            bgDark: "rgba(145, 89, 240, 0.2)",
            borderLight: "rgba(145, 89, 240, 0.26)",
            borderDark: "rgba(145, 89, 240, 0.36)",
        },
        currentUser: {
            bgDark: "rgba(127, 86, 208, 0.18)",
            bgLight: "rgba(127, 86, 208, 0.1)",
            borderDark: "rgba(127, 86, 208, 0.35)",
            borderLight: "rgba(127, 86, 208, 0.24)",
        },
    },
};

export const gradients = {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
    athletic:
        "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    cardDark:
        "linear-gradient(180deg, rgba(34, 40, 54, 0.78) 0%, rgba(20, 26, 38, 0.95) 100%)",
    cardDarkAlt:
        "linear-gradient(180deg, rgba(34, 40, 54, 0.75) 0%, rgba(20, 26, 38, 0.95) 100%)",
    fallbackImage:
        "linear-gradient(135deg, var(--mantine-color-violet-8) 0%, var(--mantine-color-grape-8) 100%)",
    imageOverlay:
        "linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%)",
};

export const styles = {
    gradientText: {
        background: gradients.primary,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    } as const,
};
