"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight, Mail, Lock, User, ShieldCheck, Loader2,
    ChevronLeft, CheckCircle2, Award, Zap, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        referralCode: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Redir if logged in
        api.get('/auth/me').then(res => {
            if (res.data.success) router.push('/');
        }).catch(() => { });

        // Check for referral code in URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');
        const refFromStorage = localStorage.getItem('referralCode');

        if (refFromUrl || refFromStorage) {
            setFormData(prev => ({ ...prev, referralCode: refFromUrl || refFromStorage || "" }));
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Security passport match failed. Check passwords.");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post("/auth/register", {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                referralCode: formData.referralCode
            });

            if (res.data.success) {
                // Clear referral code after successful registration
                localStorage.removeItem('referralCode');
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Provisioning failed. Try a different username/email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">

            {/* Left Section: Form Stage */}
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
                    className="w-full max-w-[440px] mx-auto space-y-8 py-10"
                >
                    {/* Brand Identifier */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Identity</h1>
                        <p className="text-sm text-slate-500 font-medium">Join the most advanced Teer collective on the planet.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Social Logic */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 transition-colors shadow-sm">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 transition-colors shadow-sm">
                                <span className="text-base font-bold">𝕏</span>
                                Apple
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="w-full h-px bg-slate-100" />
                            <span className="absolute px-4 bg-white text-[10px] font-bold text-slate-300 uppercase tracking-widest">or provision today</span>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Handle</label>
                                    <input
                                        type="text" required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-sm hover:border-slate-300"
                                        placeholder="teer_hunter"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Email</label>
                                    <input
                                        type="email" required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-sm hover:border-slate-300"
                                        placeholder="you@mail.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Master Security Passport</label>
                                <input
                                    type="password" required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-sm hover:border-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Verify Identity</label>
                                <input
                                    type="password" required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-sm hover:border-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Referral Code (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.referralCode}
                                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-sm"
                                        placeholder="INVITE_CODE"
                                    />
                                    {formData.referralCode && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">Guest of Heritage</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3 bg-emerald-600 text-white rounded-lg text-[13px] font-semibold shadow-xl shadow-emerald-500/10 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-200" />
                                    ) : (
                                        <>Create identity</>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center pt-2">
                            <p className="text-xs font-medium text-slate-400">
                                Already resident?{" "}
                                <Link href="/login" className="text-emerald-600 font-bold hover:underline underline-offset-4 ml-1">
                                    Secure login here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Legal footer info */}
                    <p className="text-[10px] text-slate-300 font-medium text-center pt-8">
                        By provisioning an account, you agree to our <span className="underline cursor-pointer">Security Protocol</span> and <span className="underline cursor-pointer">Terms of Service</span>.
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
                        alt="Shillong Teer Heritage"
                        className="object-cover w-full h-full brightness-[0.7] saturate-[1.2] transition-transform duration-[20s] hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-emerald-900/10 to-transparent" />
                </motion.div>

                {/* Content Overlay */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="relative z-10 w-full max-w-sm p-8"
                >
                    <div className="bg-emerald-950/20 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl space-y-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white tracking-tight">Expert Certification</h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed">
                                Align with the legacy. Access pro-tier Shillong Teer analytics and master the art of the shot.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Master Archer</span>
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Certified Expert</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Chip */}
                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between text-white/30 text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none">
                    <span>Heritage Collective</span>
                    <div className="flex items-center gap-4">
                        <span>Certified</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>2026 Protocol</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
