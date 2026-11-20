import { Outlet, useMatch } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useProgressStore } from "@/store/progressStore";

export const Layout = () => {
  const isLab = Boolean(useMatch("/laboratorio/:levelId"));
  useEffect(() => {
    const state = useProgressStore.getState();
    if (!state.loaded) state.load();
  }, []);
  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <Navbar />
      <main className={isLab ? "lab-shell" : "max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-12"}>
        <Outlet />
      </main>
    </div>
  );
};
