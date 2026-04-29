"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

export default function AnalyticsDashboard() {
    const queryClient = useQueryClient();
    const [editingPage, setEditingPage] = useState<any>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isAutoFixing, setIsAutoFixing] = useState<string | null>(null);

    const { data: topPagesData, isLoading } = useQuery({
        queryKey: ["top-pages"],
        queryFn: () => api.analytics.getTopPages(),
        refetchInterval: 10000
    });

    const autoFixMutation = useMutation({
        mutationFn: (pageId: string) => api.seo.autoFix(pageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["top-pages"] });
            setIsAutoFixing(null);
        },
        onError: () => {
            setIsAutoFixing(null);
        }
    });

    const updateSeoMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => api.seo.updatePage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["top-pages"] });
            setEditingPage(null);
        }
    });

    const handleAutoFix = (pageId: string) => {
        setIsAutoFixing(pageId);
        autoFixMutation.mutate(pageId);
    };

    const openEditModal = (page: any) => {
        setEditingPage(page);
        setEditForm({
            meta_title: page.meta_title || "",
            meta_description: page.meta_description || "",
            featured_image: page.featured_image || "",
            image_alt: page.image_alt || "",
            image_caption: page.image_caption || "",
            image_seo_filename: page.image_seo_filename || "",
            content: page.content || ""
        });
    };

    const handleSave = () => {
        if (!editingPage) return;
        updateSeoMutation.mutate({ id: editingPage.id, data: editForm });
    };

    const pages = topPagesData?.data || [];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Traffic Analytics & SEO</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor and optimize algorithmic footprinting automatically.</p>
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg w-full"></div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Page / Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">SEO Score</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pages.map((page: any) => (
                                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{page.title || "No Title"}</div>
                                        <div className="text-sm text-gray-500">{page.url}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {page.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono font-bold">
                                        {page.views.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-mono">
                                        <div className={`inline-flex px-2 py-1 rounded ${page.seo_score < 50 ? 'bg-red-100 text-red-800' : page.seo_score < 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {page.seo_score}/100
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleAutoFix(page.id)}
                                            disabled={isAutoFixing === page.id}
                                            className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 disabled:opacity-50 rounded px-3 py-1.5 text-xs transition font-semibold"
                                        >
                                            {isAutoFixing === page.id ? "Fixing..." : "Auto Fix SEO"}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(page)}
                                            className="text-gray-700 hover:text-white hover:bg-gray-800 border border-gray-400 rounded px-3 py-1.5 text-xs transition font-semibold"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pages.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No traffic data localized yet. Click through the frontend application to generate views.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Editing Modal */}
            {editingPage && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-xl font-bold">Manual SEO Override</h2>
                            <button onClick={() => setEditingPage(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Title</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.meta_title} onChange={e => setEditForm({ ...editForm, meta_title: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
                                <textarea className="w-full border rounded p-2 text-sm" rows={3} value={editForm.meta_description} onChange={e => setEditForm({ ...editForm, meta_description: e.target.value })}></textarea>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Featured Image URL</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.featured_image} onChange={e => setEditForm({ ...editForm, featured_image: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Image Alt Text</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.image_alt} onChange={e => setEditForm({ ...editForm, image_alt: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Image SEO Filename</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.image_seo_filename} onChange={e => setEditForm({ ...editForm, image_seo_filename: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Image Caption</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.image_caption} onChange={e => setEditForm({ ...editForm, image_caption: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button onClick={() => setEditingPage(null)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition font-semibold text-sm">Cancel</button>
                            <button onClick={handleSave} disabled={updateSeoMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 font-semibold text-sm">
                                {updateSeoMutation.isPending ? "Saving..." : "Save SEO Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
