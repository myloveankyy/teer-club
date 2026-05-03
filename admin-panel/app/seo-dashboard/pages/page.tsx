"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/app/api/client";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { 
    Search, Filter, ExternalLink, RefreshCw, EyeOff, ShieldCheck, 
    MoreHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, BarChart3
} from "lucide-react";

export default function AllPagesManager() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [hasIssuesFilter, setHasIssuesFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("seo_score");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["seoPages", page, debouncedSearch, statusFilter, hasIssuesFilter, sortBy, sortDir],
        queryFn: () => api.seoDashboard.getPages({
            page,
            limit: 20,
            search: debouncedSearch,
            status: statusFilter === "ALL" ? undefined : statusFilter,
            hasIssues: hasIssuesFilter === "YES" ? "true" : undefined,
            sortBy,
            sortDir
        }),
        refetchInterval: 30000
    });

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDir("asc"); // Default score to asc to show bad ones first
            if (field === "views" || field === "content_length" || field === "click_depth") {
                setSortDir("desc");
            }
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
        if (score >= 50) return "text-orange-700 bg-orange-50 border-orange-200";
        return "text-red-700 bg-red-50 border-red-200";
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">All Pages</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Detailed view of all crawled pages and their SEO metrics.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by URL or title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900/5 text-gray-800 rounded-lg text-sm outline-none transition-all placeholder-gray-400"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={hasIssuesFilter}
                        onChange={(e) => setHasIssuesFilter(e.target.value)}
                        className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-gray-300"
                    >
                        <option value="ALL">All Scores</option>
                        <option value="YES">Needs Fix (Score &lt; 60)</option>
                    </select>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-gray-300"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ERROR">Error</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Page</th>
                                <th 
                                    className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('seo_score')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Health Score <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('word_count')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Words <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Links (In/Out)</th>
                                <th 
                                    className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('click_depth')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Depth <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Indexing</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Loading pages...</p>
                                    </td>
                                </tr>
                            ) : data?.data?.pages?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-sm text-gray-500 font-medium">
                                        No pages found matching filters.
                                    </td>
                                </tr>
                            ) : (
                                data?.data?.pages?.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 text-sm truncate max-w-[300px]">{p.title || 'Untitled'}</span>
                                                <span className="text-xs text-gray-400 font-mono truncate max-w-[300px] mt-0.5">{p.url}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(p.seo_score || 0)}`}>
                                                {p.seo_score || 0}/100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-medium ${p.word_count < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {p.word_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 text-xs font-medium">
                                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p._count?.inlinks || 0} In</span>
                                                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{p._count?.outlinks || 0} Out</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-medium ${p.click_depth > 3 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {p.click_depth === null ? 'N/A' : p.click_depth}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.indexed ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 uppercase">
                                                    <ShieldCheck className="h-3.5 w-3.5" /> Indexed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 uppercase">
                                                    <EyeOff className="h-3.5 w-3.5" /> Blocked
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={process.env.NEXT_PUBLIC_FRONTEND_URL ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}${p.url}` : `http://localhost:3002${p.url}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="View Site"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/seo-dashboard/page/${p.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="View Deep Dive"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {data?.data?.pagination?.totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Page {data.data.pagination.page} of {data.data.pagination.totalPages} <span className="mx-2">|</span> Total Results: {data.data.pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(data.data.pagination.totalPages, p + 1))}
                                disabled={page === data.data.pagination.totalPages}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
