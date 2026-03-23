import { AppShell, useMantineTheme } from "@mantine/core";
import Navbar from "./Navbar/Navbar";
import { Outlet, useNavigation } from "react-router-dom";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import classes from "./RootLayout.module.css";

const RootLayout = () => {
  const navigation = useNavigation();
  const theme = useMantineTheme();
  const headerHeight = theme.other.stitch.navbarHeight - 20;

  return (
    <div className={classes.root}>
      <AppShell
        header={{ height: headerHeight }}
        padding="md"
        className={classes.appShell}
      >
        <AppShell.Header className={classes.header}>
          <Navbar />
        </AppShell.Header>

        <AppShell.Main className={classes.main}>
          {navigation.state === "loading" && <SpinnerComponent />}
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </div>
  );
};

export default RootLayout;
