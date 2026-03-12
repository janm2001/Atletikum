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
};

export const gradients = {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
    athletic: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
};

export const styles = {
    gradientText: {
        background: gradients.primary,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    } as const,
};
