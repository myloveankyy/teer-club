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
        <footer className="bg-slate-50 pt-24 pb-12 relative overflow-hidden border-t border-slate-200/60 transition-colors duration-500">
            {/* Ambient background mesh gradients for a premium light feel */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-200/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/20 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">

                    {/* Brand Column - Massive Typography & Impact */}
                    <div className="lg:col-span-5 space-y-10">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-4 group">
                                <div className="w-14 h-14 rounded-[20px] bg-white border border-slate-200 flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:scale-110 group-hover:shadow-indigo-100 transition-all duration-500">
                                    <Trophy className="w-7 h-7 text-indigo-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-[length:200%_auto] animate-gradient">
                                        Teer Club
                                    </span>
                                    <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.25em]">Heritage Analytics</span>
                                </div>
                            </Link>
                        </div>

                        <p className="text-slate-600 text-[15px] font-medium leading-relaxed max-w-md">
                            India's most advanced Teer analytics platform. Blending Meghalayan heritage with predictive machine learning to deliver real-time insights securely.
                        </p>

                        <div className="flex items-center gap-4">
                            {[Twitter, Facebook, Github].map((Icon, i) => (
                                <button key={i} className="w-12 h-12 rounded-[16px] bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links Column - Glassmorphic Bento Box Style */}
                    <div className="lg:col-span-7">
                        <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-[40px] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                                {FOOTER_LINKS.map((section) => (
                                    <div key={section.title} className="space-y-6">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            {section.title}
                                        </h4>
                                        <ul className="space-y-4">
                                            {section.links.map((link) => (
                                                <li key={link.name}>
                                                    <Link href={link.href} className="text-[14px] font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-2 group">
                                                        <span>{link.name}</span>
                                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 text-indigo-400 transition-all duration-300" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Clean & Trustworthy */}
                <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                        <span className="text-[12px] font-bold text-slate-500">© 2026 Teer Club. All rights reserved.</span>
                        <Link href="/privacy" className="text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</Link>
                        <Link href="/disclaimers" className="text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Disclaimers</Link>
                    </div>

                    <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Verified</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-3 relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
