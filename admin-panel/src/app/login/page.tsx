"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Fingerprint,
    Command,
    ShieldCheck,
    Eye,
    EyeOff
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/");
            } else {
                setError(data.error || "Authorization declined");
            }
        } catch (err) {
            setError("Network offline. Connection to backend failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#fafcff] selection:bg-blue-500/20">
            {/* Hyper-Premium Light Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-400/10 blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] rounded-full bg-sky-200/20 blur-[100px]" />

                {/* Subtle dot matrix grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
            </div>

            <div className="relative z-10 w-full max-w-md p-6 sm:p-8">
                {/* Header Title */}
                <div className="mb-10 text-center relative flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] mb-8 relative group mb-6 transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(59,130,246,0.2)]">
                        <div className="absolute inset-0 rounded-[2rem] bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Command className="w-8 h-8 text-slate-800 relative z-10" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                        Workspace
                    </h1>
                    <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <p className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase">
                            Secure Teer Infrastructure
                        </p>
                    </div>
                </div>

                {/* The Glass Interface */}
                <div className="relative rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/50">
                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase pl-1 transition-colors">
                                    Administrator ID
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Fingerprint className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 sm:text-sm rounded-2xl border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder-slate-400 border hover:bg-white focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                                        placeholder="Enter ID"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase pl-1 transition-colors">
                                    Master Key
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-4 sm:text-sm rounded-2xl border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder-slate-400 border hover:bg-white focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative group inline-flex items-center justify-center py-4 border border-transparent sm:text-sm font-semibold rounded-2xl text-white bg-slate-900 hover:bg-black hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />

                            {isLoading ? (
                                <div className="flex gap-2 items-center relative z-10">
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-400/30 border-t-white animate-spin" />
                                    <span>Authorizing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 relative z-10">
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                        Teer.Club Enterprise • End-to-End Encrypted
                    </p>
                </div>
            </div>

            <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </div>
    );
}
