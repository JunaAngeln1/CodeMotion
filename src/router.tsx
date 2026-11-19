import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { LevelsScreen } from "@/components/screens/LevelsScreen";
import { LabScreen } from "@/components/screens/LabScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { AchievementsScreen } from "@/components/screens/AchievementsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "niveles", Component: LevelsScreen },
      { path: "laboratorio/:levelId", Component: LabScreen },
      { path: "resultados", Component: ResultsScreen },
      { path: "reconocimientos", Component: AchievementsScreen },
    ],
  },
]);
