"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/app/api/client";
import { useToast } from "@/components/Toast";
import { 
    Activity, Globe, Search, RefreshCw, AlertCircle, FileText, 
    TrendingUp, ExternalLink, Hash, Link as LinkIcon 
} from "lucide-react";

export default function SeoDashboardOverview() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [fixingId, setFixingId] = useState<string | null>(null);

    const { data: dashboardData, isLoading, refetch } = useQuery({
        queryKey: ["seoDashboardOverview"],
        queryFn: () => api.seoDashboard.getOverview(),
        refetchInterval: 15000,
    });

    const triggerCrawlMutation = useMutation({
        mutationFn: () => api.seoDashboard.triggerCrawl(),
        onSuccess: (res) => {
            if (res.success) {
                showToast("Background crawl started successfully", "success");
                queryClient.invalidateQueries({ queryKey: ["seoDashboardOverview"] });
            } else {
                showToast(res.message || "Failed to start crawl", "error");
            }
        },
        onError: () => showToast("Error triggering crawl", "error")
    });

    const fixMutation = useMutation({
        mutationFn: (id: string) => api.seoDashboard.fixPage(id),
        onSuccess: (res, id) => {
            if (res.success) {
                showToast("Issue fixed successfully", "success");
                queryClient.invalidateQueries({ queryKey: ["seoDashboardOverview"] });
            } else {
                showToast(res.error || "Something went wrong. Retry.", "error");
            }
            setFixingId(null);
        },
        onError: () => {
            showToast("Something went wrong. Retry.", "error");
            setFixingId(null);
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    const { data } = dashboardData || {};

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">SEO Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Real-time intelligence on your site's search performance and health.
                    </p>
                </div>
                <div className="flex gap-3">
                    {data?.isCrawling && (
                        <span className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Crawl in progress...
                        </span>
                    )}
                    <button
                        onClick={() => triggerCrawlMutation.mutate()}
                        disabled={triggerCrawlMutation.isPending || data?.isCrawling}
                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <Search className={`h-4 w-4 mr-2 ${(triggerCrawlMutation.isPending || data?.isCrawling) ? "animate-pulse" : ""}`} />
                        Trigger Full Site Crawl
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Avg Health Score
                        </p>
                        <p className={`text-4xl font-bold mt-2 ${data?.avgScore >= 80 ? 'text-green-600' : data?.avgScore >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                            {data?.avgScore || 0}<span className="text-xl text-gray-400 font-medium">/100</span>
                        </p>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Indexed Pages
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data?.indexedPages || 0}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{data?.notIndexedPages || 0} pages blocked / noindex</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" /> Pages With Issues
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data?.pagesWithIssues || 0}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{data?.thinPages || 0} thin content pages</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-500" /> Internal Links
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data?.totalLinks || 0}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Discovered across the site</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" /> Score Distribution
                    </h2>
                    <div className="space-y-3">
                        {data?.scoreDistribution && Object.entries(data.scoreDistribution).reverse().map(([range, count]: [string, any]) => {
                            const total = data.totalPages || 1;
                            const pct = Math.round((count / total) * 100) || 0;
                            let color = "bg-green-500";
                            if (range === "60-79") color = "bg-yellow-400";
                            if (range === "40-59") color = "bg-orange-400";
                            if (range === "20-39") color = "bg-red-400";
                            if (range === "0-19") color = "bg-red-600";
                            
                            return (
                                <div key={range}>
                                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                        <span>Score {range}</span>
                                        <span>{count} pages ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions / Navigation */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" /> SEO Command Center
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/seo-dashboard/pages" className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">All Pages Manager</p>
                                <p className="text-xs text-gray-500 mt-0.5">Filter, sort, and fix individual pages.</p>
                            </div>
                        </Link>
                        
                        <Link href="/seo-dashboard/programmatic" className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-100 transition-colors">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Programmatic SEO</p>
                                <p className="text-xs text-gray-500 mt-0.5">Bulk update meta patterns by template.</p>
                            </div>
                        </Link>

                        <Link href="/seo-dashboard/indexing" className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Indexing Queue</p>
                                <p className="text-xs text-gray-500 mt-0.5">Manage GSC manual indexing requests.</p>
                            </div>
                        </Link>

                        <Link href="/seo/sitemap" className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-100 transition-colors">
                                <ExternalLink className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">XML Sitemap</p>
                                <p className="text-xs text-gray-500 mt-0.5">View and upload sitemap configurations.</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lowest Scoring Pages */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" /> Needs Immediate Attention
                    </h2>
                    <Link href="/seo-dashboard/pages?hasIssues=true" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                        View All Issues &rarr;
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Page</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Score</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Top Issue</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.topIssues?.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No pages with critical issues!</td></tr>
                            ) : data?.topIssues?.map((page: any) => (
                                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[300px]">{page.title || "Untitled"}</p>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">{page.url}</p>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${page.seo_score < 40 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {page.seo_score}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {page.score_reasons && page.score_reasons.length > 0 ? (
                                            <p className="text-xs font-medium text-gray-700 max-w-[400px] truncate">
                                                <span className="text-red-500 mr-1">■</span>
                                                {page.score_reasons[0].issue}
                                            </p>
                                        ) : (
                                            <span className="text-xs text-gray-400">Analysis pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button 
                                            onClick={() => {
                                                setFixingId(page.id);
                                                fixMutation.mutate(page.id);
                                            }}
                                            disabled={fixingId === page.id}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 ml-auto"
                                        >
                                            {fixingId === page.id ? (
                                                <>
                                                    <RefreshCw className="h-3 w-3 animate-spin" /> Fixing...
                                                </>
                                            ) : (
                                                "Fix Now"
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
