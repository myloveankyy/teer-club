import React from "react";
import { Container, Section } from "@/components/ui/Grid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function GamePageLoading() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1">
                {/* Hero Skeleton */}
                <Section
                    background="white"
                    className="!py-20 md:!py-32 border-b border-gray-100"
                >
                    <Container className="text-center">
                        <div className="flex justify-center gap-3 mb-8">
                            <Skeleton className="h-7 w-32 rounded-full" />
                            <Skeleton className="h-7 w-40 rounded-full" />
                        </div>
                        <div className="flex flex-col items-center gap-3 mb-8">
                            <Skeleton className="h-12 w-3/4 md:w-2/3" />
                        </div>
                        <Skeleton className="mx-auto h-4 w-5/6 md:w-2/3 mb-12" />
                        <Skeleton className="mx-auto h-12 w-64 rounded-full" />
                    </Container>
                </Section>

                {/* Live Result Card Skeleton */}
                <section className="px-4 py-12 sm:px-6 lg:px-8 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-3 w-36" />
                            </div>
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 p-6 lg:p-10">
                            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col items-center p-8 rounded-2xl bg-gray-50">
                                    <Skeleton className="h-3 w-16 mb-4" />
                                    <Skeleton className="h-16 w-24" />
                                </div>
                                <div className="flex flex-col items-center p-8 rounded-2xl bg-gray-50">
                                    <Skeleton className="h-3 w-16 mb-4" />
                                    <Skeleton className="h-16 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Previous Results Skeleton */}
                <Section background="white" className="!py-16">
                    <Container>
                        <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-8">
                            <div>
                                <Skeleton className="h-6 w-64 mb-2" />
                                <Skeleton className="h-3 w-44" />
                            </div>
                            <Skeleton className="h-9 w-36 rounded-lg" />
                        </div>
                        <div className="rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="grid grid-cols-3 bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-3 w-20 mx-auto" />
                                <Skeleton className="h-3 w-20 mx-auto" />
                            </div>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="grid grid-cols-3 px-6 py-4 border-b border-gray-50 items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-10 mx-auto rounded-full" />
                                    <Skeleton className="h-6 w-10 mx-auto rounded-full" />
                                </div>
                            ))}
                        </div>
                    </Container>
                </Section>
            </main>
        </div>
    );
}
