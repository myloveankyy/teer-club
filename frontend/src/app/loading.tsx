import React from "react";
import { Container, Section, Grid } from "@/components/ui/Grid";
import { Skeleton, PredictionSkeleton } from "@/components/ui/Skeleton";

export default function GlobalLoading() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1">
                {/* Hero Skeleton */}
                <Section background="white">
                    <Container className="text-center">
                        <div className="flex justify-center mb-6">
                            <Skeleton className="h-6 w-32 rounded-full" />
                        </div>
                        <div className="flex flex-col items-center gap-4 mb-4">
                            <Skeleton className="h-10 w-3/4 md:w-1/2" />
                            <Skeleton className="h-10 w-2/3 md:w-1/3" />
                        </div>
                        <Skeleton className="mx-auto h-4 w-5/6 md:w-1/2" />
                    </Container>
                </Section>

                {/* Grid Skeleton */}
                <Section className="!py-10">
                    <Container>
                        <div className="mb-10 flex items-center justify-between">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                        <Grid cols={3}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <PredictionSkeleton key={i} />
                            ))}
                        </Grid>
                    </Container>
                </Section>
            </main>
        </div>
    );
}
