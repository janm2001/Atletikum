import { AppShell } from "@mantine/core";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div>
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header>
          <Navbar />
        </AppShell.Header>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </div>
  );
};

export default RootLayout;
