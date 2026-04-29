"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import { useToast } from "@/components/Toast";
import { useState } from "react";

export default function SitemapPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: statusData, isLoading } = useQuery({
        queryKey: ["sitemapStatus"],
        queryFn: () => api.seo.sitemap.getStatus(),
        refetchInterval: isGenerating ? 2000 : false,
    });

    const generateMutation = useMutation({
        mutationFn: () => api.seo.sitemap.generate(),
        onSuccess: (res: any) => {
            if (res.success) {
                showToast("Sitemap generation started successfully", "success");
                setIsGenerating(true);
                queryClient.invalidateQueries({ queryKey: ["sitemapStatus"] });
                // Stop polling after some time or when status changes
                setTimeout(() => setIsGenerating(false), 10000);
            }
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to trigger sitemap generation", "error");
            setIsGenerating(false);
        },
    });

    const handleGenerate = () => {
        setIsGenerating(true);
        generateMutation.mutate();
    };

    const status = statusData?.data;

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sitemap Management</h1>
                <p className="mt-2 text-gray-600">
                    Maintain a production-grade sitemap for search engines. This system automatically syncs with new content.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                        <p className="text-xl font-bold text-gray-900">{status ? 'Active' : 'Pending'}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total URLs</p>
                    <p className="text-3xl font-black text-gray-900">{status?.totalUrls || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Sync</p>
                    <p className="text-sm font-bold text-gray-700">
                        {status?.lastUpdated ? new Date(status.lastUpdated).toLocaleString() : 'Never'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xl mb-8">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Manual Refresh</h2>
                            <p className="text-sm font-medium text-gray-500">Trigger a fresh crawl of all active pages and results.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || generateMutation.isPending}
                        className={`group relative px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all transform active:scale-95 ${isGenerating
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-black hover:shadow-2xl hover:shadow-gray-300 hover:-translate-y-1"
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                GENERATING...
                            </>
                        ) : (
                            <>
                                <svg className={`w-5 h-5 transition-transform duration-700 ${isGenerating ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                GENERATE SITEMAP
                            </>
                        )}
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sitemap URL</h3>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 font-mono text-sm group">
                                <span className="flex-1 text-gray-700 truncate font-bold">https://teer.club/sitemap.xml</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText("https://teer.club/sitemap.xml");
                                        showToast("URL copied to clipboard", "success");
                                    }}
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                </button>
                                <a
                                    href="https://teer.club/sitemap.xml"
                                    target="_blank"
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-emerald-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Performance</h3>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-500">Generation Time</span>
                                    <span className="text-sm font-black text-gray-900">{status?.durationMs || 0}ms</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min((status?.durationMs || 0) / 10, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-tight">Pro SEO Tip</h4>
                                <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
                                    The sitemap is configured to prioritize live result pages and recently updated dynamic routes. It automatically updates whenever new results are imported or pages are created.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Crawler Accessibility</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-600">Search Engine Indexing</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">Visible</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-600">Compression</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 uppercase">GZIP Enabled</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-medium text-gray-600">Clean URLs</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
