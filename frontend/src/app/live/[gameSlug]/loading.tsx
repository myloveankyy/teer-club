import React from "react";

export default function GamePageLoading() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1">
                {/* Hero Skeleton — Dark */}
                <section className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
                        {/* Badge skeletons */}
                        <div className="flex justify-center gap-3 mb-10">
                            <div className="h-8 w-36 rounded-full bg-white/5 animate-pulse" />
                            <div className="h-8 w-32 rounded-full bg-white/5 animate-pulse" />
                        </div>
                        {/* Title skeleton */}
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="h-12 w-80 rounded-xl bg-white/5 animate-pulse" />
                            <div className="h-8 w-60 rounded-xl bg-white/5 animate-pulse" />
                        </div>
                        <div className="mx-auto h-4 w-96 max-w-full rounded bg-white/5 animate-pulse mb-14" />

                        {/* Result card skeleton */}
                        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
                            <div className="px-8 pt-8 pb-4 flex justify-between border-b border-white/5">
                                <div className="space-y-2">
                                    <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
                                    <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
                                </div>
                                <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
                            </div>
                            <div className="px-8 py-10 grid grid-cols-2 gap-6">
                                <div className="flex flex-col items-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
                                    <div className="h-3 w-16 rounded bg-white/5 animate-pulse mb-4" />
                                    <div className="h-16 w-24 rounded-xl bg-white/5 animate-pulse" />
                                </div>
                                <div className="flex flex-col items-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
                                    <div className="h-3 w-16 rounded bg-white/5 animate-pulse mb-4" />
                                    <div className="h-16 w-24 rounded-xl bg-white/5 animate-pulse" />
                                </div>
                            </div>
                            <div className="px-8 py-4 border-t border-white/5 flex justify-between">
                                <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
                                <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                </section>

                {/* Table Skeleton */}
                <section className="bg-white py-16 md:py-24">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 pb-8 border-b border-gray-100">
                            <div className="h-5 w-28 rounded-full bg-gray-100 animate-pulse mb-4" />
                            <div className="h-8 w-72 rounded-xl bg-gray-100 animate-pulse mb-2" />
                            <div className="h-4 w-56 rounded bg-gray-100 animate-pulse" />
                        </div>
                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-3 bg-gray-900 px-6 py-4">
                                <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
                                <div className="h-3 w-8 rounded bg-white/10 animate-pulse mx-auto" />
                                <div className="h-3 w-8 rounded bg-white/10 animate-pulse mx-auto" />
                            </div>
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className={`grid grid-cols-3 px-6 py-4 border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                                    <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                                    <div className="h-7 w-11 rounded-lg bg-gray-100 animate-pulse mx-auto" />
                                    <div className="h-7 w-11 rounded-lg bg-gray-100 animate-pulse mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
