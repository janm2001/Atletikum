import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import RootLayout from "./components/layout/RootLayout";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import Profile from "./components/Profile/Profile";
import TrainingLogs from "./components/TrainingLogs/TrainingLogs";
import KnowledgeBase from "./components/KnowledgeBase/KnowledgeBase";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import NotFoundPage from "./components/NotFound/NotFoundPage";

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
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/pregled" replace />,
      },
      {
        path: "pregled",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "profil",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "zapis-treninga",
        element: (
          <ProtectedRoute>
            <TrainingLogs />
          </ProtectedRoute>
        ),
      },
      {
        path: "edukacija",
        element: (
          <ProtectedRoute>
            <KnowledgeBase />
          </ProtectedRoute>
        ),
      },
      {
        path: "upravljanje",
        element: (
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </MantineProvider>
  );
}

export default App;
