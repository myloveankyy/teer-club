'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Database,
    ShieldAlert,
    Users,
    Settings,
    Command,
    LogOut,
    PenTool,
    Gift,
    MessageSquare,
    Megaphone,
    Wallet,
    Rocket,
    Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Results Data', href: '/results', icon: Database },
    { name: 'Posts', href: '/posts', icon: ShieldAlert },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Groups', href: '/groups', icon: MessageSquare },
    { name: 'Finance', href: '/finance', icon: Wallet },
    { name: 'Rewards', href: '/rewards', icon: Gift },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
    { name: 'Blog', href: '/blog', icon: PenTool },
    { name: 'SEO Tools', href: '/seo', icon: Rocket },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [siteName, setSiteName] = useState("Teer.Club");
    useEffect(() => {
        const INTERNAL_API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
        fetch(`${INTERNAL_API}/api/admin/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.site_logo) setLogoUrl(data.site_logo);
                if (data.site_name) setSiteName(data.site_name);
            })
            .catch(err => console.error("Failed to fetch settings in sidebar", err));
    }, []);

    return (
        <aside className={cn("flex flex-col", className)}>
            <div className="h-[72px] flex items-center px-6 border-b border-slate-200/50 shrink-0">
                <div className="flex items-center gap-3 w-full">
                    {logoUrl ? (
                        <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-200">
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-black rounded-xl flex items-center justify-center shadow-md">
                            <Command className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-[15px] tracking-tight text-slate-900 leading-tight">{siteName}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative",
                                isActive
                                    ? "bg-white text-blue-600 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 ring-1 ring-slate-900/5"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                            )}
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform duration-300",
                                isActive ? "text-blue-600" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-600"
                            )} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-200/50 shrink-0 bg-white/30 backdrop-blur-md">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            <span className="text-slate-700 text-sm font-black tracking-tighter">MA</span>
                        </div>
                        <div className="flex flex-col text-sm truncate max-w-[100px]">
                            <span className="font-bold text-slate-900 truncate">Ankyy</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Master</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
