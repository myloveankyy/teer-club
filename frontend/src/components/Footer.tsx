'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Target, BookOpen, MapPin, ShieldCheck, Mail, Github, Twitter, Facebook, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on app-like immersive pages to keep UI clean
    const isImmersivePage = pathname?.startsWith('/profile') ||
        pathname?.startsWith('/notifications') ||
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/register');

    if (isImmersivePage) return null;

    const FOOTER_LINKS = [
        {
            title: "Live Results",
            links: [
                { name: "Shillong Teer", href: "/#shillong" },
                { name: "Khanapara Teer", href: "/#khanapara" },
                { name: "Juwai Teer", href: "/#juwai" },
                { name: "Historical Archive", href: "/history" }
            ]
        },
        {
            title: "Analytics & Tools",
            links: [
                { name: "AI Common Numbers", href: "/predictions" },
                { name: "Daily Dream Number", href: "/dreams" },
                { name: "Winner Leaderboard", href: "/winners" },
                { name: "Pattern Analyzer", href: "/tools" }
            ]
        },
        {
            title: "Community",
            links: [
                { name: "Public Feed", href: "/" },
                { name: "Expert Blogs", href: "/blog" },
                { name: "Rewards Program", href: "/referral" },
                { name: "Changelog", href: "/notifications/changelog" }
            ]
        }
    ];

    return (
        <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-black tracking-tight block">Teer Club</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Heritage Analytics</span>
                            </div>
                        </Link>

                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            India&apos;s most advanced Teer analytics platform. We blend Meghalayan heritage with modern machine learning to provide real-time results and high-precision predictions.
                        </p>

                        <div className="flex items-center gap-4">
                            {[Twitter, Facebook, Github].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                                    <Icon className="w-4.5 h-4.5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                        {FOOTER_LINKS.map((section) => (
                            <div key={section.title} className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{section.title}</h4>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="text-[13px] font-bold text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2 group">
                                                <span>{link.name}</span>
                                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                        <span className="text-[11px] font-bold text-slate-500">© 2026 Teer Club. All rights reserved.</span>
                        <Link href="/privacy" className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/disclaimers" className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors">Disclaimers</Link>
                    </div>

                    <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verified Platform</span>
                        </div>
                        <div className="w-px h-4 bg-slate-800" />
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Server Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
