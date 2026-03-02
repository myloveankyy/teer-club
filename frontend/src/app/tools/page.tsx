import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Teer Number Calculator & Analytics Tools',
    description: 'Free Teer tools: formula calculator, pattern analyzer, and probability predictor for Shillong Teer, Khanapara Teer, and Juwai Teer numbers.',
    alternates: { canonical: 'https://teer.club/tools' },
    openGraph: {
        title: 'Teer Number Calculator & Analytics Tools | Teer Club',
        description: 'Use our free Teer tools: dream number calculator, formula calculator, and common number finder.',
        url: 'https://teer.club/tools',
        type: 'website',
    },
};

import Link from 'next/link';
import { ChevronLeft, Calculator } from 'lucide-react';

import { TeerCalculator } from '@/components/tools/TeerCalculator';
import { PatternAnalyzer } from '@/components/tools/PatternAnalyzer';
import { ProbabilityPredictor } from '@/components/tools/ProbabilityPredictor';

export default function ToolsPage() {
    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 font-sans selection:bg-purple-500/20 relative overflow-x-hidden">
            {/* Very subtle light gradient background */}
            <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#FFFFFF] to-[#F0F2F5] pointer-events-none z-0" />

            {/* Header removed as it is now global */}

            <div className="relative z-10 px-4 md:px-6 max-w-[800px] mx-auto mt-6">

                <div className="mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
                        Analytics Suite
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Powerful calculators and predictors to analyze your targets.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {/* Calculator spans full width on mobile, 1 col on desktop */}
                    <div className="md:col-span-1 min-h-[400px]">
                        <TeerCalculator />
                    </div>

                    {/* Right column on desktop for the other two */}
                    <div className="md:col-span-1 flex flex-col gap-5 md:gap-6 min-h-[400px]">
                        <div className="flex-1">
                            <PatternAnalyzer />
                        </div>
                        <div className="flex-1">
                            <ProbabilityPredictor />
                        </div>
                    </div>
                </div>

            </div>


        </main>
    );
}
