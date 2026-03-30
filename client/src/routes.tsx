import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute.tsx";
import { AdminRoute } from "./components/ProtectedRoute/AdminRoute.tsx";
import RootLayout from "./components/layout/RootLayout.tsx";
import { ErrorPage } from "./pages/Error/ErrorPage.tsx";

type RouteModule = { default: React.ComponentType<unknown> };

const lazyRoute = (importFn: () => Promise<RouteModule>) =>
  async () => {
    try {
      const { default: Component } = await importFn();
      return { Component };
    } catch (error) {
      if (
        error instanceof TypeError &&
        (error.message.includes("Failed to fetch dynamically imported module") ||
          error.message.includes("Importing a module script failed") ||
          error.message.includes("error loading dynamically imported module"))
      ) {
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw error;
    }
  };

export const router = createBrowserRouter([
  {
    path: "login",
    lazy: lazyRoute(() => import("./pages/Login/Login.tsx")),
  },
  {
    path: "register",
    lazy: lazyRoute(() => import("./pages/Register/Register.tsx")),
  },
  {
    path: "dobrodosli",
    lazy: lazyRoute(() => import("./pages/Welcome/Welcome.tsx")),
  },
  {
    path: "zaboravljena-lozinka",
    lazy: lazyRoute(() => import("./pages/ForgotPassword/ForgotPassword.tsx")),
  },
  {
    path: "reset-lozinka/:token",
    lazy: lazyRoute(() => import("./pages/ResetPassword/ResetPassword.tsx")),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/pregled" replace />,
      },
      {
        path: "pregled",
        lazy: lazyRoute(() => import("./pages/Dashboard/Dashboard.tsx")),
      },
      {
        path: "profil",
        lazy: lazyRoute(() => import("./pages/Profile/Profile.tsx")),
      },
      {
        path: "postavke",
        lazy: lazyRoute(() => import("./pages/Settings/Settings.tsx")),
      },
      {
        path: "zapis-treninga",
        lazy: lazyRoute(() => import("./pages/TrainingLogs/TrainingLogs.tsx")),
      },
      {
        path: "zapis-treninga/:id",
        lazy: lazyRoute(() => import("./pages/TrackWorkout/TrackWorkout.tsx")),
      },
      {
        path: "edukacija",
        lazy: lazyRoute(() => import("./pages/KnowledgeBase/KnowledgeBase.tsx")),
      },
      {
        path: "edukacija/:id",
        lazy: lazyRoute(() => import("./pages/KnowledgeBase/ArticleDetail.tsx")),
      },
      {
        path: "edukacija/:id/kviz",
        lazy: lazyRoute(() => import("./pages/KnowledgeBase/QuizPage.tsx")),
      },
      {
        path: "upravljanje",
        element: <AdminRoute />,
        children: [
          {
            index: true,
            lazy: lazyRoute(() => import("./pages/AdminPanel/AdminPanel.tsx")),
          },
        ],
      },
      {
        path: "ljestvica",
        lazy: lazyRoute(() => import("./pages/Leaderboard/Leaderboard.tsx")),
      },
      {
        path: "prijatelji",
        lazy: lazyRoute(() => import("./pages/Friends/FriendsList.tsx")),
      },
      {
        path: "izazovi/povijest",
        lazy: lazyRoute(() => import("./pages/Challenges/ChallengeHistory.tsx")),
      },
      {
        path: "slavlje",
        lazy: lazyRoute(() => import("./pages/XpCelebration/XpCelebration.tsx")),
      },
    ],
  },
  {
    path: "*",
    lazy: lazyRoute(() => import("./pages/NotFound/NotFoundPage.tsx")),
  },
]);
