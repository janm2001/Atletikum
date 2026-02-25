import { AppShell } from "@mantine/core";
import Navbar from "./Navbar";
import { Outlet, useNavigation } from "react-router-dom";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";

const RootLayout = () => {
  const navigation = useNavigation();
  return (
    <div>
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header>
          <Navbar />
        </AppShell.Header>

        <AppShell.Main>
          {navigation.state === "loading" && <SpinnerComponent />}
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </div>
  );
};

export default RootLayout;
