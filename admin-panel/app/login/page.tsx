"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [id, setId] = useState("");
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulate a slight delay for better UX feel
        setTimeout(() => {
            if (id === "myloveankyy" && passcode === "8638019522") {
                document.cookie = "admin_auth=true; path=/; max-age=86400; secure; samesite=strict"; // 1 day secure
                const apiKey = process.env.NEXT_PUBLIC_API_KEY || (window.location.hostname !== "localhost" ? "teer-admin-prod-2026-X9k2mP" : "dev-key-change-in-production");
                localStorage.setItem("apiKey", apiKey);
                router.push("/");
            } else {
                setError("Invalid credentials provided.");
                setIsLoading(false);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl tracking-tighter shadow-sm">
                        TC
                    </div>
                </div>
                <h2 className="text-center text-2xl font-semibold text-gray-900 tracking-tight">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Teer Club Administration Portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 sm:rounded-xl sm:px-10 border border-gray-200 shadow-sm">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                                Administrator ID
                            </label>
                            <div className="mt-2">
                                <input
                                    id="id"
                                    name="id"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="passcode" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="passcode"
                                    name="passcode"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Sign in"}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Teer Club Platform. All rights reserved.
                </div>
            </div>
        </div>
    );
}
