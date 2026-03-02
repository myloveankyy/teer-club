"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight, Mail, Lock, ShieldCheck, Loader2,
    ChevronLeft, Globe, Sparkles, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Redir if logged in
        api.get('/auth/me').then(res => {
            if (res.data.success) router.push('/');
        }).catch(() => { });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", formData);
            if (res.data.success) {
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Credentials failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Left Section: Context & Forms */}
            <div className="flex flex-col flex-1 items-center justify-center p-6 md:p-12 lg:p-16 relative bg-white overflow-y-auto">
                <button
                    onClick={() => router.push('/')}
                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95 lg:flex items-center gap-2 group hidden"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[420px] mx-auto space-y-8 py-10"
                >
                    {/* Brand Identifier */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg mb-2">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unlock Everything</h1>
                        <p className="text-sm text-slate-500 font-medium">Log in to your professional Teer analytics suite.</p>
                    </div>

                    {/* Form Stage */}
                    <div className="space-y-6">
                        {/* Social Logic */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 transition-colors shadow-sm">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 transition-colors shadow-sm">
                                <span className="text-base font-bold">𝕏</span>
                                Handle
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="w-full h-px bg-slate-100" />
                            <span className="absolute px-4 bg-white text-[10px] font-bold text-slate-300 uppercase tracking-widest">or handle legacy</span>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="email" required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm shadow-sm hover:border-slate-300"
                                        placeholder="user@teer.club"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-0.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Security Passport</label>
                                    <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="password" required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm shadow-sm hover:border-slate-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3 bg-slate-900 text-white rounded-lg text-[13px] font-semibold shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                    ) : (
                                        <>Sign in</>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center pt-2">
                            <p className="text-xs font-medium text-slate-400">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4 ml-1">
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Legal footer info */}
                    <p className="text-[10px] text-slate-300 font-medium text-center pt-8">
                        By continuing, you authorize access to your Teer Club environment and agree to our <span className="underline cursor-pointer">Terms of Service</span>.
                    </p>
                </motion.div>
            </div>

            {/* Right Section: Artistic Imagery */}
            <div className="hidden lg:flex relative bg-slate-900 overflow-hidden items-center justify-center">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src="/auth-bg.png"
                        alt="Shillong Teer Tradition"
                        className="object-cover w-full h-full brightness-[0.8] saturate-[1.2] transition-transform duration-[20s] hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-indigo-900/10 to-transparent" />
                </motion.div>

                {/* Content Overlay */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="relative z-10 w-full max-w-sm p-8"
                >
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white tracking-tight">The Art of Precision</h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed">
                                Join 10k+ experts mastering the Shillong legacy with data-driven insights and archival accuracy.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Archer Collective</p>
                        </div>
                    </div>
                </motion.div>

                {/* Info Chip */}
                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between text-white/30 text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none">
                    <span>Shillong &bull; 2026 Protocol</span>
                    <div className="flex items-center gap-4">
                        <span>Certified</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>Security</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
