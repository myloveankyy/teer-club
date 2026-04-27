"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CommonNumbersError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Common Numbers Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Load Common Numbers
            </h1>
            <p className="text-gray-500 max-w-md mb-8 text-sm leading-relaxed">
                We couldn&apos;t load today&apos;s common numbers. This may be a temporary issue. Please try again or check back shortly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-primary/20"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                </button>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl font-bold text-sm transition-all border border-gray-200"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
