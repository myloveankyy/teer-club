import React from "react";
import { Container, Section, Grid } from "@/components/ui/Grid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LiveLoading() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1">
                {/* Header Skeleton */}
                <Section
                    background="white"
                    className="!py-20 border-b border-border/50"
                >
                    <Container className="text-center">
                        <div className="mx-auto max-w-4xl">
                            <div className="flex justify-center mb-6">
                                <Skeleton className="h-7 w-36 rounded-full" />
                            </div>
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <Skeleton className="h-10 w-3/4 md:w-2/3" />
                                <Skeleton className="h-10 w-1/2 md:w-1/3" />
                            </div>
                            <Skeleton className="mx-auto h-4 w-5/6 md:w-2/3" />
                        </div>
                    </Container>
                </Section>

                {/* Results Grid Skeleton */}
                <Section background="gray" className="!py-16 lg:!py-28">
                    <Container>
                        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border/50 pb-8">
                            <div>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                            <Skeleton className="h-10 w-28 rounded-lg" />
                        </div>
                        <Grid cols={3}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-3xl bg-white border border-gray-100 p-6 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-gray-50">
                                            <Skeleton className="h-3 w-8 mb-2" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50">
                                            <Skeleton className="h-3 w-8 mb-2" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            ))}
                        </Grid>
                    </Container>
                </Section>
            </main>
        </div>
    );
}
