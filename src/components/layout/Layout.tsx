import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pb-12"><Outlet /></main>
    </div>
  );
};
