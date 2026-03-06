import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute.tsx";
import RootLayout from "./components/layout/RootLayout.tsx";
import { ErrorPage } from "./pages/Error/ErrorPage.tsx";

export const router = createBrowserRouter([
  {
    path: "login",
    lazy: async () => {
      const { default: Login } = await import("./pages/Login/Login.tsx");
      return { Component: Login };
    },
  },
  {
    path: "register",
    lazy: async () => {
      const { default: Register } =
        await import("./pages/Register/Register.tsx");
      return { Component: Register };
    },
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
        lazy: async () => {
          const { default: Dashboard } =
            await import("./pages/Dashboard/Dashboard.tsx");
          return { Component: Dashboard };
        },
      },
      {
        path: "profil",
        lazy: async () => {
          const { default: Profile } =
            await import("./pages/Profile/Profile.tsx");
          return { Component: Profile };
        },
      },
      {
        path: "zapis-treninga",
        lazy: async () => {
          const { default: TrainingLogs } =
            await import("./pages/TrainingLogs/TrainingLogs.tsx");
          return { Component: TrainingLogs };
        },
      },
      {
        path: "zapis-treninga/:id",
        lazy: async () => {
          const { default: TrackWorkout } =
            await import("./pages/TrackWorkout/TrackWorkout.tsx");
          return { Component: TrackWorkout };
        },
      },
      {
        path: "edukacija",
        lazy: async () => {
          const { default: KnowledgeBase } =
            await import("./pages/KnowledgeBase/KnowledgeBase.tsx");
          return { Component: KnowledgeBase };
        },
      },
      {
        path: "edukacija/:id",
        lazy: async () => {
          const { default: ArticleDetail } =
            await import("./pages/KnowledgeBase/ArticleDetail.tsx");
          return { Component: ArticleDetail };
        },
      },
      {
        path: "edukacija/:id/kviz",
        lazy: async () => {
          const { default: QuizPage } =
            await import("./pages/KnowledgeBase/QuizPage.tsx");
          return { Component: QuizPage };
        },
      },
      {
        path: "upravljanje",
        lazy: async () => {
          const { default: AdminPanel } =
            await import("./pages/AdminPanel/AdminPanel.tsx");
          return { Component: AdminPanel };
        },
      },
    ],
  },
  {
    path: "*",
    lazy: async () => {
      const { default: NotFoundPage } =
        await import("./pages/NotFound/NotFoundPage.tsx");
      return { Component: NotFoundPage };
    },
  },
]);
