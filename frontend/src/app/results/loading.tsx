import React from "react";
import { Container, Section, Grid } from "@/components/ui/Grid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ResultsLoading() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1">
                {/* Hero Skeleton */}
                <Section
                    background="white"
                    className="!py-16 md:!py-24 border-b border-gray-100"
                >
                    <Container>
                        <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between py-8">
                            <div className="flex-1 text-center md:text-left max-w-2xl px-4 md:px-0">
                                <Skeleton className="h-6 w-32 rounded-full mb-6" />
                                <Skeleton className="h-10 w-3/4 mb-3" />
                                <Skeleton className="h-10 w-1/2 mb-6" />
                                <Skeleton className="h-4 w-5/6 mb-2" />
                                <Skeleton className="h-4 w-4/6 mb-10" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-12 w-40 rounded-2xl" />
                                    <Skeleton className="h-12 w-40 rounded-2xl" />
                                </div>
                            </div>
                            <Skeleton className="h-64 w-full md:w-72 rounded-3xl" />
                        </div>
                    </Container>
                </Section>

                {/* Results List Skeleton */}
                <Section className="!py-16 md:!py-20" background="gray">
                    <Container>
                        <div className="mx-auto max-w-5xl">
                            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
                                <div>
                                    <Skeleton className="h-7 w-44 mb-2" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl bg-white border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                                    >
                                        <Skeleton className="h-5 w-40" />
                                        <div className="flex-1 flex gap-6">
                                            <Skeleton className="h-8 w-16" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Container>
                </Section>
            </main>
        </div>
    );
}
