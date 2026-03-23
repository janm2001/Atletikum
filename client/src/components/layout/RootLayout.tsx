import {
  AppShell,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Navbar from "./Navbar/Navbar";
import { Outlet, useNavigation } from "react-router-dom";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";

const RootLayout = () => {
  const navigation = useNavigation();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme("dark");
  const mode = computedColorScheme === "dark" ? "dark" : "light";
  const headerHeight = theme.other.stitch.navbarHeight - 20;
  const surface = theme.other.stitch[mode].surface;
  const appBackground = theme.other.stitch[mode].appBackground;
  const headerGradient =
    mode === "dark"
      ? theme.other.stitch.headerGradientDark
      : theme.other.stitch.headerGradientLight;

  return (
    <div
      style={{
        backgroundColor: appBackground,
        minHeight: "100vh",
      }}
    >
      <AppShell
        header={{ height: headerHeight }}
        padding="md"
        style={{ backgroundColor: "transparent" }}
      >
        <AppShell.Header
          style={{
            background: headerGradient,
            borderBottom: `1px solid ${theme.other.stitch[mode].borderSubtle}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Navbar />
        </AppShell.Header>

        <AppShell.Main
          style={{
            backgroundColor: surface,
            minHeight: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          {navigation.state === "loading" && <SpinnerComponent />}
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </div>
  );
};

export default RootLayout;
