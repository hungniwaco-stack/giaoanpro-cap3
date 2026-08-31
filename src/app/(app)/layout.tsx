"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-ink/10 bg-paper-card px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
            className="rounded-lg p-1.5 text-xl text-ink hover:bg-sand"
          >
            ☰
          </button>
          <span className="font-display text-lg font-semibold text-pine">✎ AI Giáo Án Pro</span>
        </div>

        {children}
      </div>
    </div>
  );
}
