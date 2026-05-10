import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found | Teer Club",
    description: "The page you are looking for does not exist. Return to Teer Club for live results and common numbers.",
};

export default function NotFound() {
    return (
        <div id="main-content" role="main" className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-white">
            <div className="mb-8">
                <span className="text-[120px] md:text-[180px] font-black text-gray-100 leading-none select-none block">
                    404
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                Page Not Found
            </h1>
            <p className="text-base text-gray-500 max-w-md mb-10 leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Check today&apos;s Teer results or browse our platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl shadow-primary/20"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Go Home
                </Link>
                <Link
                    href="/live"
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl font-bold text-sm tracking-wide transition-all border border-gray-200"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Live Results
                </Link>
            </div>
        </div>
    );
}
