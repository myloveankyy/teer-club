"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-full w-full bg-[#fafcff] relative overflow-hidden">
            {/* Ambient Background Elements matching Login */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-400/5 blur-[100px] pointer-events-none" />

            {/* Sidebar Navigation */}
            <Sidebar className="w-[280px] shrink-0 border-r border-slate-200/50 bg-white/50 backdrop-blur-xl hidden md:block relative z-10" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                {/* Topbar */}
                <header className="h-[72px] border-b border-slate-200/50 bg-white/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
                    <h1 className="font-bold text-xl tracking-tight text-slate-900">Workspace</h1>
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-slate-200 shadow-sm rounded-full px-4 py-1.5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">System Live</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
