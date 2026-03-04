import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import RootLayout from "./components/layout/RootLayout";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import Profile from "./pages/Profile/Profile";
import TrainingLogs from "./pages/TrainingLogs/TrainingLogs";
import KnowledgeBase from "./pages/KnowledgeBase/KnowledgeBase";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
import NotFoundPage from "./components/NotFound/NotFoundPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TrackWorkout from "./pages/TrackWorkout/TrackWorkout";

const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/pregled" replace />,
      },
      {
        path: "pregled",
        element: <Dashboard />,
      },
      {
        path: "profil",
        element: <Profile />,
      },
      {
        path: "zapis-treninga",
        element: <TrainingLogs />,
      },
      {
        path: "zapis-treninga/:id",
        element: <TrackWorkout />,
      },
      {
        path: "edukacija",
        element: <KnowledgeBase />,
      },
      {
        path: "upravljanje",
        element: <AdminPanel />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 5 min
    },
  },
});

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </UserProvider>
    </MantineProvider>
  );
}

export default App;
