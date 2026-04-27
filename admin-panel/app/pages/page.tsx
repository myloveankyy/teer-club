/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef } from "react";
import api, { Page } from "@/app/api/client";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import {
    FileText, Search, RefreshCw, Eye, Heart,
    ExternalLink, Edit2, Shield, EyeOff, Globe,
    BarChart3, Filter, Info, MoreHorizontal, Check, X, ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function PagesManagement() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [viewingAudit, setViewingAudit] = useState<Page | null>(null);
    const [saving, setSaving] = useState(false);
    const [auditingId, setAuditingId] = useState<string | null>(null);

    const { showToast } = useToast();
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchPages = async (page = 1, showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await api.pages.getAll({
                page,
                limit: pagination.limit,
                search: search || undefined,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                type: typeFilter !== "ALL" ? typeFilter : undefined
            });
            setPages(res.data.pages);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPages(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter, typeFilter]);

    useEffect(() => {
        pollingRef.current = setInterval(() => {
            fetchPages(pagination.page, false);
        }, 15000); // Increased poll interval to 15s

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [pagination.page, search, statusFilter, typeFilter]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.pages.sync();
            showToast("Pages synced successfully", "success");
            await fetchPages(1);
        } catch (err) {
            console.error(err);
            showToast("Failed to sync pages", "error");
        } finally {
            setSyncing(false);
        }
    };

    const handleManualAudit = async (id: string) => {
        setAuditingId(id);
        try {
            const res = await api.pages.audit(id);
            if (res.success) {
                showToast("Audit completed", "success");
                setPages(prev => prev.map(p => p.id === id ? { ...p, ...res.data, last_audit_at: new Date().toISOString() } : p));
                if (viewingAudit?.id === id) {
                    setViewingAudit({ ...viewingAudit, ...res.data, last_audit_at: new Date().toISOString() });
                }
            }
        } catch (err) {
            console.error(err);
            showToast("Audit failed", "error");
        } finally {
            setAuditingId(null);
        }
    };

    const handleSavePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPage) return;
        setSaving(true);
        try {
            await api.pages.update(editingPage.id, {
                status: editingPage.status,
                meta_title: editingPage.meta_title,
                meta_description: editingPage.meta_description,
                indexed: editingPage.indexed,
                index_status: editingPage.index_status
            });
            showToast("Page updated", "success");
            setEditingPage(null);
            await fetchPages(pagination.page);
        } catch (err) {
            console.error(err);
            showToast("Save failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Pages Manager</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Monitor and optimize all active frontend routes.
                    </p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? "Syncing..." : "Sync Pages"}
                </button>
            </div>

            {/* Simple Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Discoverd</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average SEO Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">82/100</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Crawl Status</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                        <p className="text-lg font-bold text-gray-900">Optimal</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900/5 text-gray-800 rounded-lg text-sm outline-none transition-all placeholder-gray-400"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-gray-300"
                    >
                        <option value="ALL">Status: All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-gray-300"
                    >
                        <option value="ALL">Type: All</option>
                        <option value="STATIC">Static</option>
                        <option value="DYNAMIC">Dynamic</option>
                        <option value="PREDICTION">Prediction</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Page Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Score</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Index Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Engagement</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Sync</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Loading pages...</p>
                                    </td>
                                </tr>
                            ) : pages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <p className="text-gray-500 text-sm font-medium">No pages found.</p>
                                    </td>
                                </tr>
                            ) : (
                                pages.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                                                <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{p.url}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(p.seo_score || 0)}`}>
                                                {p.seo_score || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${p.index_status === "INDEXED" ? "text-blue-600" : "text-gray-400"
                                                    }`}>
                                                    {p.index_status === "INDEXED" ? <ShieldCheck className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                    {p.index_status}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    Status: {p.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4 text-xs font-medium text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900">{p.views || 0}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">Views</span>
                                                </div>
                                                <div className="flex flex-col px-4 border-l border-gray-100">
                                                    <span className="text-gray-900">{p.likes || 0}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">Likes</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-600 font-medium">{p.last_audit_at ? new Date(p.last_audit_at).toLocaleDateString() : "Never"}</p>
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
                                                <button
                                                    onClick={() => setViewingAudit(p)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="View Details"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingPage(p)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="Edit SEO"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages} <span className="mx-2">|</span> Total Results: {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchPages(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchPages(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Insights Modal */}
            <Modal
                isOpen={!!viewingAudit}
                onClose={() => setViewingAudit(null)}
                title="Page SEO Details"
                size="lg"
            >
                {viewingAudit && (
                    <div className="space-y-6 py-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Word Count</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{viewingAudit.content_length || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">H1 Tags</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{viewingAudit.h1_count || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Internal Links</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{viewingAudit.internal_links || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SEO Score</p>
                                <p className={`text-xl font-bold mt-1 ${viewingAudit.seo_score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {viewingAudit.seo_score || 0}%
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" /> Improvement Suggestions
                            </h3>
                            <div className="space-y-2">
                                {(viewingAudit.audit_results?.issues || []).map((issue: string, idx: number) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-red-50/50 border border-red-100 rounded-lg">
                                        <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-semibold text-red-800">{issue}</p>
                                    </div>
                                ))}
                                {(viewingAudit.audit_results?.suggestions || []).map((sugg: string, idx: number) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-gray-700">{sugg}</p>
                                    </div>
                                ))}
                                {(!viewingAudit.audit_results?.issues?.length && !viewingAudit.audit_results?.suggestions?.length) && (
                                    <p className="text-center py-6 text-gray-500 text-sm h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                                        No suggestions available for this page.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => handleManualAudit(viewingAudit.id)}
                                disabled={auditingId === viewingAudit.id}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${auditingId === viewingAudit.id ? "animate-spin" : ""}`} />
                                Re-Audit Now
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingPage}
                onClose={() => setEditingPage(null)}
                title="Edit Page SEO"
                size="lg"
            >
                {editingPage && (
                    <form onSubmit={handleSavePage} className="space-y-5 py-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Title</label>
                            <input
                                type="text"
                                value={editingPage.meta_title || ""}
                                onChange={e => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-900/5 outline-none transition-all"
                                placeholder="Enter SEO meta title"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Description</label>
                            <textarea
                                value={editingPage.meta_description || ""}
                                onChange={e => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium h-28 resize-none focus:ring-2 focus:ring-gray-900/5 outline-none transition-all"
                                placeholder="Enter meta description snippet..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                <select
                                    value={editingPage.status}
                                    onChange={e => setEditingPage({ ...editingPage, status: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none cursor-pointer"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Indexing</label>
                                <select
                                    value={editingPage.index_status || "DISCOVERED"}
                                    onChange={e => setEditingPage({ ...editingPage, index_status: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none cursor-pointer"
                                >
                                    <option value="INDEXED">Indexed</option>
                                    <option value="DISCOVERED">Discovered</option>
                                    <option value="NOT_INDEXED">Blocked (No-Index)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                id="isIndexed"
                                type="checkbox"
                                checked={editingPage.indexed}
                                onChange={e => setEditingPage({ ...editingPage, indexed: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="isIndexed" className="text-sm font-medium text-gray-700">
                                Visible to Search Engines
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
