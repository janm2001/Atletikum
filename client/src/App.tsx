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
