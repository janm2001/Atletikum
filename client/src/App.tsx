import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import SpinnerComponent from "./components/SpinnerComponent/SpinnerComponent.tsx";
import { router } from "./routes.tsx";
import { queryClient } from "./lib/queryClient";
import { appCssVariablesResolver, appTheme } from "./theme/appTheme";

function App() {
  return (
    <MantineProvider
      theme={appTheme}
      defaultColorScheme="dark"
      cssVariablesResolver={appCssVariablesResolver}
    >
      <Notifications position="top-right" />
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<SpinnerComponent />}>
            <RouterProvider router={router} />
          </Suspense>
        </QueryClientProvider>
      </UserProvider>
    </MantineProvider>
  );
}

export default App;
