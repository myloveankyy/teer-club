"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optionally log the error to an error reporting service
        console.error("Global UI Error Caught:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong!
            </h1>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                We apologize for the inconvenience. An unexpected error has occurred on our end. Please try again or return to the homepage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                    <Home className="h-4 w-4" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
