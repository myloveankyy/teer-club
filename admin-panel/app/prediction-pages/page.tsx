"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/components/Toast";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api") + "/admin";

export default function PredictionPages() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [page, setPage] = useState(1);

    const { data: response, isLoading } = useQuery({
        queryKey: ["admin-prediction-pages", page],
        queryFn: async () => {
            const apiKey = localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_API_KEY || "";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/pages?type=PREDICTION&page=${page}&limit=20`, {
                headers: { "X-Admin-Key": apiKey }
            });
            const json = await res.json();
            return json.data;
        }
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            const apiKey = localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_API_KEY || "";
            const res = await fetch(`${API_BASE_URL}/predictions/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Key": apiKey
                },
                body: JSON.stringify({
                    forceOverwrite: true
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            showToast(`Successfully generated tasks and SEO page.`, "success");
            queryClient.invalidateQueries({ queryKey: ["admin-prediction-pages"] });
        },
        onError: (err: any) => {
            showToast(`Error: ${err.message}`, "error");
        }
    });

    const indexMutation = useMutation({
        mutationFn: async (id: string) => {
            const apiKey = localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_API_KEY || "";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/pages/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Key": apiKey
                },
                body: JSON.stringify({ indexed: true })
            });
            return res.json();
        },
        onSuccess: () => {
            showToast("Page indexed successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["admin-prediction-pages"] });
        }
    });

    const pages = response?.pages || [];
    const totalPages = response?.pagination?.totalPages || 1;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Prediction Pages</h1>
                    <p className="text-sm text-gray-500">Auto-generated SEO pages for daily predictions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                    >
                        {generateMutation.isPending ? "Generating..." : "Trigger Generation Fallback"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & SEO</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : pages.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No predictions pages found.</td></tr>
                        ) : pages.map((p: any) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                    /{p.slug}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">{p.title}</div>
                                    <div className="text-xs text-gray-500">{p.meta_title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}${p.url}`); showToast("Copied URL", "success"); }}
                                        className="text-gray-500 hover:text-indigo-600"
                                    >Copy URL</button>
                                    <a href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}${p.url}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600">View Page</a>
                                    <button onClick={() => indexMutation.mutate(p.id)} className="text-green-600 hover:text-green-800">Index Manually</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex justify-between">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-gray-700">Previous</button>
                        <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm text-gray-700">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}
