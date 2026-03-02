"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Define context
interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [pathname]);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/admin/verify", {
                method: "GET",
                credentials: "include", // essential for cookies
            });

            if (res.ok) {
                const data = await res.json();
                if (data.authenticated) {
                    setIsAuthenticated(true);
                    setUser(data.user);
                    if (pathname === "/login") {
                        router.push("/");
                    }
                } else {
                    handleUnauthorized();
                }
            } else {
                handleUnauthorized();
            }
        } catch (err) {
            console.error("Auth check failed", err);
            handleUnauthorized();
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnauthorized = () => {
        setIsAuthenticated(false);
        setUser(null);
        if (pathname !== "/login") {
            router.push("/login");
        }
    }

    const logout = async () => {
        try {
            await fetch("/api/admin/logout", {
                method: "POST",
                credentials: "include",
            });
            setIsAuthenticated(false);
            setUser(null);
            router.push("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    // Prevent flashing content while checking auth
    if (isLoading && pathname !== "/login") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
