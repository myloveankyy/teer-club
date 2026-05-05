"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/app/api/client";
import { 
    Globe, RefreshCw, CheckCircle, XCircle, Clock, Search 
} from "lucide-react";

export default function IndexingQueue() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const { data, isLoading } = useQuery({
        queryKey: ["seoIndexQueue", page, statusFilter],
        queryFn: () => api.seoDashboard.getIndexQueue({
            page,
            limit: 20,
            status: statusFilter === "ALL" ? undefined : statusFilter,
        }),
        refetchInterval: 15000
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "FAILED": return <XCircle className="h-4 w-4 text-red-500" />;
            case "SENT": return <Globe className="h-4 w-4 text-blue-500" />;
            default: return <Clock className="h-4 w-4 text-orange-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-100 text-green-700";
            case "FAILED": return "bg-red-100 text-red-700";
            case "SENT": return "bg-blue-100 text-blue-700";
            default: return "bg-orange-100 text-orange-700";
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Indexing Queue</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Monitor requests sent to Google Search Console Indexing API. (Requires GSC integration in Phase 2)
                    </p>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["QUEUED", "SENT", "SUCCESS", "FAILED"].map(status => (
                    <div 
                        key={status}
                        onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
                        className={`bg-white p-4 rounded-xl border ${statusFilter === status ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'} shadow-sm cursor-pointer hover:border-gray-300 transition-all`}
                    >
                        <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            {getStatusIcon(status)} {status}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {data?.data?.statusCounts?.[status] || 0}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" /> Recent Requests
                    </h2>
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium outline-none cursor-pointer hover:border-gray-300"
                        >
                            <option value="ALL">All Status</option>
                            <option value="QUEUED">Queued</option>
                            <option value="SENT">Sent</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Method</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Requested At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center">
                                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : data?.data?.requests?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                                        No indexing requests found.
                                    </td>
                                </tr>
                            ) : (
                                data?.data?.requests?.map((req: any) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[400px]">
                                                {req.page?.title || 'Unknown Page'}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{req.url}</p>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(req.status)}`}>
                                                {getStatusIcon(req.status)} {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {req.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <p className="text-sm text-gray-900">{new Date(req.requestedAt).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">{new Date(req.requestedAt).toLocaleTimeString()}</p>
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
                            Page {data?.data?.pagination?.page} of {data?.data?.pagination?.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(data?.data?.pagination?.totalPages || 1, p + 1))}
                                disabled={page === data?.data?.pagination?.totalPages}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
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
