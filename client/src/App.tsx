import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import SpinnerComponent from "./components/SpinnerComponent/SpinnerComponent.tsx";
import { router } from "./routes.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
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
