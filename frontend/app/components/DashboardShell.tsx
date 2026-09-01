"use client";

import { ReactNode, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="lg:pl-[270px]">
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}
