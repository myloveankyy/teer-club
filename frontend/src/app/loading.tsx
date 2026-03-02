import { BentoSkeleton } from "@/components/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen pt-4 md:pt-6 bg-[#F0F2F5]">
            <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-8 mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-pulse">
                    <div>
                        <div className="h-8 w-64 bg-slate-200 rounded-md mb-2"></div>
                        <div className="h-3 w-48 bg-slate-200 rounded-md"></div>
                    </div>
                    <div className="h-10 w-64 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
            <BentoSkeleton />
        </div>
    );
}
