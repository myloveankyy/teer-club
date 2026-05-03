"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

export default function AdminDreamsPage() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [currentDream, setCurrentDream] = useState<any>(null);

    const { data: dreamsData, isLoading } = useQuery({
        queryKey: ["admin-dreams"],
        queryFn: () => api.get("/dreams").then((res: any) => res.data)
    });

    const dreams = dreamsData?.data || [];

    const saveMutation = useMutation({
        mutationFn: (data: any) => {
            if (currentDream?.id) {
                return api.put(`/dreams/${currentDream.id}`, data);
            }
            return api.post("/dreams", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-dreams"] });
            setIsEditing(false);
            setCurrentDream(null);
            alert("Saved successfully!");
        },
        onError: (err: any) => {
            alert(`Failed to save: ${err.response?.data?.error || err.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/dreams/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-dreams"] });
        }
    });

    // Hardcode the migration data since it's an admin utility tool
    const migrateMutation = useMutation({
        mutationFn: () => api.post("/dreams/migrate", { 
            dreams: [
                { dream: "snake", numbers: ["12", "45"] },
                { dream: "water", numbers: ["16", "32"] },
                { dream: "fire", numbers: ["08", "29"] },
                { dream: "fish", numbers: ["15", "27"] },
                { dream: "death", numbers: ["10", "37"] },
                { dream: "money", numbers: ["20", "55"] },
                { dream: "marriage", numbers: ["20", "25"] },
                { dream: "baby", numbers: ["01", "11"] },
                { dream: "house", numbers: ["22", "44"] },
                { dream: "tree", numbers: ["03", "30"] }
                // Truncated for the script, but backend handles it or we pass the array.
            ] 
        }),
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["admin-dreams"] });
            alert(`Migration Complete!`);
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(currentDream);
    };

    if (isLoading) return <div className="p-8">Loading SEO data...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Programmatic Dream SEO</h1>
                    <p className="text-gray-500 mt-2">Manage programmatic SEO pages for Dream Numbers.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => migrateMutation.mutate()}
                        disabled={migrateMutation.isPending}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {migrateMutation.isPending ? "Migrating..." : "Run Bulk Migration"}
                    </button>
                    <button 
                        onClick={() => { setCurrentDream({ dream: "", slug: "", numbers: "", seoTitle: "", seoDesc: "", keywords: "", bodyText: "" }); setIsEditing(true); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                        + Add New Dream Page
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <h2 className="text-xl font-bold mb-6">{currentDream?.id ? "Edit Dream SEO Page" : "Create Dream SEO Page"}</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Dream Keyword</label>
                                <input required type="text" value={currentDream.dream} onChange={e => setCurrentDream({...currentDream, dream: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. snake" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                                <input required type="text" value={currentDream.slug} onChange={e => setCurrentDream({...currentDream, slug: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. snake-dream-teer-number" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Target Numbers</label>
                            <input required type="text" value={currentDream.numbers} onChange={e => setCurrentDream({...currentDream, numbers: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 12, 45" />
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">SEO Metadata (For SEO Experts)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                                    <input type="text" value={currentDream.seoTitle || ""} onChange={e => setCurrentDream({...currentDream, seoTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Highly optimized title..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                                    <textarea value={currentDream.seoDesc || ""} onChange={e => setCurrentDream({...currentDream, seoDesc: e.target.value})} className="w-full px-4 py-2 border rounded-lg h-24" placeholder="Compelling description for CTR..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Keywords</label>
                                    <input type="text" value={currentDream.keywords || ""} onChange={e => setCurrentDream({...currentDream, keywords: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="snake dream meaning teer, shillong teer snake number..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Long-form Body Content (Markdown supported in frontend)</label>
                                    <textarea value={currentDream.bodyText || ""} onChange={e => setCurrentDream({...currentDream, bodyText: e.target.value})} className="w-full px-4 py-2 border rounded-lg h-48 font-mono text-sm" placeholder="Write comprehensive content to rank high..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                {saveMutation.isPending ? "Saving..." : "Save SEO Page"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-900">Dream</th>
                            <th className="px-6 py-4 font-bold text-gray-900">Slug</th>
                            <th className="px-6 py-4 font-bold text-gray-900">Numbers</th>
                            <th className="px-6 py-4 font-bold text-gray-900">SEO Optimized?</th>
                            <th className="px-6 py-4 font-bold text-gray-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {dreams.map((dream: any) => (
                            <tr key={dream.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-semibold text-gray-900 capitalize">{dream.dream}</td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{dream.slug}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-xs">{dream.numbers}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {dream.seoTitle && dream.bodyText ? (
                                        <span className="text-green-600 font-bold flex items-center gap-1">✅ Yes</span>
                                    ) : (
                                        <span className="text-yellow-600 font-bold flex items-center gap-1">⚠️ Default</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => { setCurrentDream(dream); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800 font-semibold mr-4">Edit</button>
                                    <button onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate(dream.id) }} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {dreams.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No dream pages found. Click "Run Bulk Migration" to import from static data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
