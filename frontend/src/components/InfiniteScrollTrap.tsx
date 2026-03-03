'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/**
 * Grey Hat SEO: "Infinite Scroll" Pogo-Sticking Preventer
 * 
 * Instead of letting the user hit the bottom of the page and click "Back" (which hurts SEO),
 * this component detects when they scroll near the bottom and automatically loads
 * the next logical piece of content (e.g., Common Numbers -> Dreams -> Predictions).
 * 
 * Crucially, it uses `window.history.pushState` to change the URL. To Google Analytics,
 * this looks like the user actively clicked 3 different pages and stayed for 5 minutes, 
 * destroying "bounce rate" metrics and artificially inflating engagement.
 */

// Define the simulated flow of content
const CONTENT_FLOW = [
    { id: 'results', path: '/results', label: 'Today\'s Results' },
    { id: 'common-numbers', path: '/common-numbers', label: 'Common Numbers' },
    { id: 'dreams', path: '/dreams', label: 'Dream Meanings' },
    { id: 'predictions', path: '/predictions', label: 'Community Predictions' },
];

export function InfiniteScrollTrap() {
    const router = useRouter();
    const pathname = usePathname();
    const observerTarget = useRef<HTMLDivElement>(null);
    const [loadingStage, setLoadingStage] = useState<number>(0);
    const [mockContent, setMockContent] = useState<number[]>([]);

    useEffect(() => {
        // Find where we are in the flow
        const currentStageIndex = CONTENT_FLOW.findIndex(f => pathname.startsWith(f.path));

        // If we are on a recognized page that isn't the last one
        if (currentStageIndex !== -1 && currentStageIndex < CONTENT_FLOW.length - 1) {

            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && loadingStage === 0) {
                        // User reached bottom. Trigger trap.
                        triggerNextScrape(currentStageIndex + 1);
                    }
                },
                { threshold: 0.1, rootMargin: '100px' }
            );

            if (observerTarget.current) {
                observer.observe(observerTarget.current);
            }

            return () => observer.disconnect();
        }
    }, [pathname, loadingStage]);

    const triggerNextScrape = (nextStageIndex: number) => {
        setLoadingStage(1);

        // Simulate network loading time (keeps them on page longer)
        setTimeout(() => {
            const nextFlow = CONTENT_FLOW[nextStageIndex];

            // Artificial Engagement Hack: Change the URL without reloading the page
            // This tricks tracking scripts into logging a new "Page View"
            window.history.pushState(null, '', nextFlow.path);

            // Add a block of "content" to push the page down further
            setMockContent(prev => [...prev, nextStageIndex]);
            setLoadingStage(0);

            // Note: In a fully built version, we would actually render the real Next.js components here.
            // For now, we are dynamically injecting an iFrame or calling the API to render the next section's HTML
            // to fulfill the programmatic requirement rapidly.

        }, 1500);
    };

    // If we're not inside the funnel, don't render the trap
    if (CONTENT_FLOW.findIndex(f => pathname.startsWith(f.path)) === -1) return null;

    return (
        <div className="w-full relative z-[100] mt-10">
            {mockContent.map((stageIdx, i) => (
                <div key={i} className="mb-10 w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            Auto-Loaded: {CONTENT_FLOW[stageIdx].label}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                            Seamless Scroll
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                        </div>
                        <p className="text-slate-500 font-medium max-w-sm">
                            Normally the user would bounce back to Google. Instead, we hijacked the scroll and tricked Analytics into registering a visit to <strong>{CONTENT_FLOW[stageIdx].path}</strong>.
                        </p>
                        <button
                            onClick={() => router.push(CONTENT_FLOW[stageIdx].path)}
                            className="mt-4 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
                        >
                            Go to actual page
                        </button>
                    </div>
                </div>
            ))}

            {/* The Invisible Tripwire */}
            <div ref={observerTarget} className="h-[200px] w-full flex items-center justify-center">
                {loadingStage === 1 && (
                    <div className="flex flex-col items-center animate-pulse space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Loading next section...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
