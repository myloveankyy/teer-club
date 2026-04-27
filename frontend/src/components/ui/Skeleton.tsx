import React from "react";

export const Skeleton = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`animate-pulse rounded-xl bg-gray-200/50 ${className}`} />
    );
};

export const CardSkeleton = () => {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-6">
            <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
};

export const PredictionSkeleton = () => {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <Skeleton className="h-3 w-24 mb-4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-12 w-12" />
                        <Skeleton className="h-12 w-12" />
                        <Skeleton className="h-12 w-12" />
                        <Skeleton className="h-12 w-12" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
};
