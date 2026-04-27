"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";

export default function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <main 
      className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "pl-[72px]" : "pl-64"
      }`}
    >
      <div className="p-6">
        {children}
      </div>
    </main>
  );
}