"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [id, setId] = useState("");
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (id === "myloveankyy" && passcode === "8638019522") {
            document.cookie = "admin_auth=true; path=/; max-age=86400; secure; samesite=strict"; // 1 day secure
            // Store the API key so all admin API calls include it
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || "dev-key-change-in-production";
            localStorage.setItem("apiKey", apiKey);
            router.push("/");
        } else {
            setError("Invalid ID or passcode. Access denied.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                        Secure Access
                    </div>
                </div>
                <h2 className="text-center text-4xl font-black text-gray-900 tracking-tight uppercase">
                    Admin <span className="text-blue-600">Console</span>
                </h2>
                <p className="mt-3 text-center text-sm font-medium text-gray-500">
                    Sign in to the Teer Club Management System
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
                <div className="bg-white py-12 px-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:rounded-[2.5rem] border border-gray-100/50 backdrop-blur-sm">
                    <form className="space-y-8" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                                Administrator ID
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter identifier"
                                    className="block w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white text-sm font-medium shadow-sm hover:border-gray-200"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                    Secure Passcode
                                </label>
                                <a href="#" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white text-sm font-medium shadow-sm hover:border-gray-200"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-xs font-bold">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-4 px-6 rounded-2xl text-sm font-bold text-white bg-[#111827] hover:bg-black shadow-xl shadow-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-gray-200"
                            >
                                Authenticate System
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                        <span>© 2026 TEER.CLUB</span>
                        <span>V2.4 SERVER-SIDE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
