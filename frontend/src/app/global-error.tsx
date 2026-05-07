"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to the console
        console.error("Global UI Error Caught:", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white">
                    <div className="bg-red-50 p-4 rounded-full mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        Platform Error
                    </h1>
                    <p className="text-base text-gray-500 max-w-md mb-6 leading-relaxed">
                        A critical error occurred while loading the Teer Club platform.
                        Please try refreshing the page.
                    </p>
                    
                    <div className="bg-gray-100 p-4 rounded-lg mb-8 text-left max-w-2xl w-full overflow-auto">
                        <p className="text-sm font-mono text-red-600">{error.message || "Unknown Error"}</p>
                        {error.digest && <p className="text-xs text-gray-400 mt-2">Digest: {error.digest}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => reset()}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl shadow-blue-600/20"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl font-bold text-sm tracking-wide transition-all border border-gray-200"
                        >
                            Return Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
