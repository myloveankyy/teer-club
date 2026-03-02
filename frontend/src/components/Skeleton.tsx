import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-xl bg-slate-200",
                className
            )}
            {...props}
        />
    );
}

export function BentoSkeleton() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-12 animate-pulse px-4 md:px-8 max-w-[1600px] mx-auto">
            {/* Left Column Skeleton */}
            <div className="xl:col-span-5 flex flex-col gap-6">
                <Skeleton className="h-[320px] w-full rounded-3xl" />
                <Skeleton className="h-[320px] w-full rounded-3xl" />
            </div>

            {/* Right Column Skeleton */}
            <div className="xl:col-span-7 flex flex-col gap-6">
                <Skeleton className="h-[280px] w-full rounded-3xl" />
                <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
        </div>
    );
}
