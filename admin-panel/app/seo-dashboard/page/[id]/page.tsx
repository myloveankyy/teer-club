"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/api/client";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { 
    ChevronLeft, RefreshCw, AlertTriangle, CheckCircle2, 
    ExternalLink, Activity, Type, Link as LinkIcon, Zap, X, Search, Globe
} from "lucide-react";

export default function PageDeepDive() {
    const { id } = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [isFixing, setIsFixing] = useState(false);

    const { data: pageData, isLoading } = useQuery({
        queryKey: ["seoPageDetail", id],
        queryFn: () => api.seoDashboard.getPageDetail(id as string),
        enabled: !!id
    });

    const fixMutation = useMutation({
        mutationFn: () => api.seoDashboard.fixPage(id as string),
        onSuccess: (res) => {
            if (res.success) {
                showToast("Page SEO auto-fixed successfully!", "success");
                queryClient.invalidateQueries({ queryKey: ["seoPageDetail", id] });
            } else {
                showToast(res.error || "Fix failed", "error");
            }
        },
        onError: () => showToast("Auto-fix failed", "error"),
        onSettled: () => setIsFixing(false)
    });

    if (isLoading) return <div className="p-10 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;
    if (!pageData?.data) return <div className="p-10 text-center">Page not found</div>;

    const p = pageData.data;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{p.title || 'Untitled'}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 font-mono">{p.url}</span>
                        <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://teer.club'}${p.url}`} target="_blank" className="text-blue-600 hover:text-blue-800">
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
                <div className="ml-auto">
                    <button 
                        onClick={() => { setIsFixing(true); fixMutation.mutate(); }}
                        disabled={isFixing}
                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
                    >
                        {isFixing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-yellow-400" />}
                        {isFixing ? "Applying Fixes..." : "Auto-Fix SEO"}
                    </button>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Score</span>
                    <span className={`text-4xl font-black ${p.seo_score >= 80 ? 'text-green-600' : p.seo_score >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                        {p.seo_score}
                    </span>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                    <Activity className="h-20 w-20 text-gray-50 absolute -right-4 -bottom-4" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Technical</span>
                    <span className="text-2xl font-bold text-gray-900 relative z-10">{p.score_technical || 0}/100</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                    <Type className="h-20 w-20 text-gray-50 absolute -right-4 -bottom-4" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Content</span>
                    <span className="text-2xl font-bold text-gray-900 relative z-10">{p.score_content || 0}/100</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                    <LinkIcon className="h-20 w-20 text-gray-50 absolute -right-4 -bottom-4" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Linking</span>
                    <span className="text-2xl font-bold text-gray-900 relative z-10">{p.score_linking || 0}/100</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                    <Zap className="h-20 w-20 text-gray-50 absolute -right-4 -bottom-4" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Performance</span>
                    <span className="text-2xl font-bold text-gray-900 relative z-10">{p.score_performance || 0}/100</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" /> Improvement Opportunities
                        </h2>
                        <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {p.score_reasons?.length || 0}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {!p.score_reasons || p.score_reasons.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                                <p className="font-medium text-gray-900">Perfect! No issues found.</p>
                                <p className="text-sm mt-1">This page is fully optimized.</p>
                            </div>
                        ) : (
                            p.score_reasons.map((reason: any, idx: number) => (
                                <div key={idx} className={`p-4 ${reason.impact === 'HIGH' ? 'bg-red-50/30' : ''}`}>
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            {reason.impact === 'HIGH' ? (
                                                <X className="h-4 w-4 text-red-500" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-orange-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${reason.impact === 'HIGH' ? 'text-red-900' : 'text-gray-900'}`}>
                                                {reason.issue}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{reason.fix}</p>
                                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                {reason.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Meta Snippet Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Search className="h-4 w-4 text-blue-500" /> SERP Preview
                        </h2>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="max-w-xl mx-auto">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Globe className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-900 leading-tight">Teer.club</span>
                                    <span className="text-xs text-gray-500 leading-tight">https://teer.club{p.url}</span>
                                </div>
                            </div>
                            <h3 className="text-[#1a0dab] text-xl font-medium cursor-pointer hover:underline mb-1 mt-2 line-clamp-1 leading-tight">
                                {p.meta_title || p.title || 'No Title Set'}
                            </h3>
                            <p className="text-[#4d5156] text-sm line-clamp-2 leading-snug">
                                {p.meta_description || 'No meta description set for this page. Search engines will attempt to generate one from page content.'}
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Robots Directive</span>
                                <span className="text-sm font-mono text-gray-900">{p.robots_directive || 'index,follow'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 overflow-hidden">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Canonical</span>
                                <span className="text-sm font-mono text-gray-900 truncate block" title={p.canonical_url}>
                                    {p.canonical_url || 'None (Self)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Graph Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-purple-500" /> Internal Link Map
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-0">
                        <div className="px-5 py-3 border-b border-gray-100 bg-blue-50/30">
                            <h3 className="text-xs font-bold text-gray-700 uppercase">Inbound Links ({p.inlinks?.length || 0})</h3>
                            <p className="text-xs text-gray-500">Pages linking to this page</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {p.inlinks?.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500 text-center">No internal links point to this page.</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {p.inlinks?.map((link: any, i: number) => (
                                        <li key={i} className="p-3 hover:bg-gray-50">
                                            <Link href={`/seo-dashboard/page/${link.fromPage.id}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
                                                {link.fromPage.title}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1 break-all bg-gray-100 px-2 py-0.5 rounded inline-block border border-gray-200">
                                                Anchor: "{link.anchorText || 'Empty'}"
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="p-0">
                        <div className="px-5 py-3 border-b border-gray-100 bg-purple-50/30">
                            <h3 className="text-xs font-bold text-gray-700 uppercase">Outbound Links ({p.outlinks?.length || 0})</h3>
                            <p className="text-xs text-gray-500">Links on this page pointing elsewhere</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {p.outlinks?.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500 text-center">This page has no internal outbound links.</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {p.outlinks?.map((link: any, i: number) => (
                                        <li key={i} className="p-3 hover:bg-gray-50">
                                            <Link href={`/seo-dashboard/page/${link.toPage.id}`} className="text-sm font-medium text-purple-600 hover:underline truncate block">
                                                {link.toPage.title}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1 break-all bg-gray-100 px-2 py-0.5 rounded inline-block border border-gray-200">
                                                Anchor: "{link.anchorText || 'Empty'}"
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
