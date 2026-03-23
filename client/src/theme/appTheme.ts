import {
  Anchor,
  Badge,
  Card,
  createTheme,
  type CSSVariablesResolver,
} from "@mantine/core";

type StitchPalette = {
  appBackground: string;
  surface: string;
  surfaceRaised: string;
  surfaceInteractive: string;
  borderSubtle: string;
  borderStrong: string;
  textMuted: string;
};

type StitchTokens = {
  dark: StitchPalette;
  light: StitchPalette;
  navbarHeight: number;
  headerGradientDark: string;
  headerGradientLight: string;
};

declare module "@mantine/core" {
  export interface MantineThemeOther {
    stitch: StitchTokens;
  }
}

const stitchTokens: StitchTokens = {
  dark: {
    appBackground: "#101723",
    surface: "#141A26",
    surfaceRaised: "#1A2231",
    surfaceInteractive: "#222836",
    borderSubtle: "rgba(146, 160, 188, 0.24)",
    borderStrong: "rgba(146, 160, 188, 0.38)",
    textMuted: "#9DA8C2",
  },
  light: {
    appBackground: "#F4F6FC",
    surface: "#FFFFFF",
    surfaceRaised: "#F8FAFF",
    surfaceInteractive: "#EDF1FA",
    borderSubtle: "rgba(69, 85, 116, 0.2)",
    borderStrong: "rgba(69, 85, 116, 0.3)",
    textMuted: "#4E5C79",
  },
  navbarHeight: 96,
  headerGradientDark:
    "linear-gradient(180deg, rgba(34, 40, 54, 0.96) 0%, rgba(20, 26, 38, 0.94) 100%)",
  headerGradientLight:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 249, 255, 0.96) 100%)",
};

export const appCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--app-navbar-height": `${stitchTokens.navbarHeight}px`,
    "--app-header-height": `${stitchTokens.navbarHeight - 20}px`,
  },
  dark: {
    "--app-background": stitchTokens.dark.appBackground,
    "--app-surface": stitchTokens.dark.surface,
    "--app-surface-raised": stitchTokens.dark.surfaceRaised,
    "--app-surface-interactive": stitchTokens.dark.surfaceInteractive,
    "--app-border-subtle": stitchTokens.dark.borderSubtle,
    "--app-border-strong": stitchTokens.dark.borderStrong,
    "--app-text-muted": stitchTokens.dark.textMuted,
    "--app-header-gradient": stitchTokens.headerGradientDark,
    "--leaderboard-gold-bg": "rgba(224, 177, 58, 0.2)",
    "--leaderboard-gold-border": "rgba(224, 177, 58, 0.42)",
    "--leaderboard-silver-bg": "rgba(168, 181, 199, 0.2)",
    "--leaderboard-silver-border": "rgba(168, 181, 199, 0.44)",
    "--leaderboard-bronze-bg": "rgba(198, 135, 83, 0.2)",
    "--leaderboard-bronze-border": "rgba(198, 135, 83, 0.46)",
    "--leaderboard-fallback-bg": "rgba(145, 89, 240, 0.2)",
    "--leaderboard-fallback-border": "rgba(145, 89, 240, 0.36)",
    "--leaderboard-current-bg": "rgba(127, 86, 208, 0.18)",
    "--leaderboard-current-border": "rgba(127, 86, 208, 0.35)",
  },
  light: {
    "--app-background": stitchTokens.light.appBackground,
    "--app-surface": stitchTokens.light.surface,
    "--app-surface-raised": stitchTokens.light.surfaceRaised,
    "--app-surface-interactive": stitchTokens.light.surfaceInteractive,
    "--app-border-subtle": stitchTokens.light.borderSubtle,
    "--app-border-strong": stitchTokens.light.borderStrong,
    "--app-text-muted": stitchTokens.light.textMuted,
    "--app-header-gradient": stitchTokens.headerGradientLight,
    "--leaderboard-gold-bg": "rgba(224, 177, 58, 0.14)",
    "--leaderboard-gold-border": "rgba(224, 177, 58, 0.3)",
    "--leaderboard-silver-bg": "rgba(168, 181, 199, 0.14)",
    "--leaderboard-silver-border": "rgba(168, 181, 199, 0.32)",
    "--leaderboard-bronze-bg": "rgba(198, 135, 83, 0.14)",
    "--leaderboard-bronze-border": "rgba(198, 135, 83, 0.34)",
    "--leaderboard-fallback-bg": "rgba(145, 89, 240, 0.12)",
    "--leaderboard-fallback-border": "rgba(145, 89, 240, 0.26)",
    "--leaderboard-current-bg": "rgba(127, 86, 208, 0.1)",
    "--leaderboard-current-border": "rgba(127, 86, 208, 0.24)",
  },
});

export const appTheme = createTheme({
  primaryColor: "stitch",
  defaultRadius: "md",
  fontFamily:
    'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  headings: {
    fontFamily:
      'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontWeight: "700",
  },
  colors: {
    stitch: [
      "#f3edff",
      "#e6dbff",
      "#d2b8ff",
      "#bd93ff",
      "#ab74ff",
      "#9d62fd",
      "#9159f0",
      "#8754d4",
      "#7f56d0",
      "#6844aa",
    ],
  },
  defaultGradient: {
    from: "stitch.6",
    to: "stitch.8",
    deg: 142,
  },
  other: {
    stitch: stitchTokens,
  },
  components: {
    Card: Card.extend({
      defaultProps: {
        withBorder: true,
        radius: "lg",
        shadow: "sm",
      },
      styles: {
        root: {
          backgroundColor: "var(--app-surface-raised)",
          borderColor: "var(--app-border-subtle)",
        },
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        radius: "sm",
      },
    }),
    Anchor: Anchor.extend({
      styles: {
        root: {
          textDecorationColor: "transparent",
          transition:
            "color 140ms ease, text-decoration-color 140ms ease, opacity 140ms ease",
          "&:hover": {
            textDecorationColor: "currentColor",
          },
        },
      },
    }),
  },
});
