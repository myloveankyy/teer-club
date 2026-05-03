"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

// Full static dream data for bulk migration
const STATIC_DREAMS = [
    { dream: "snake", numbers: ["12", "45"] },
    { dream: "water", numbers: ["16", "32"] },
    { dream: "fire", numbers: ["08", "29"] },
    { dream: "fish", numbers: ["15", "27"] },
    { dream: "death", numbers: ["10", "37"] },
    { dream: "money", numbers: ["20", "55"] },
    { dream: "marriage", numbers: ["20", "25"] },
    { dream: "baby", numbers: ["01", "11"] },
    { dream: "house", numbers: ["22", "44"] },
    { dream: "tree", numbers: ["03", "30"] },
    { dream: "dog", numbers: ["17", "71"] },
    { dream: "cat", numbers: ["18", "81"] },
    { dream: "bird", numbers: ["09", "90"] },
    { dream: "cow", numbers: ["04", "40"] },
    { dream: "elephant", numbers: ["06", "60"] },
    { dream: "tiger", numbers: ["05", "50"] },
    { dream: "lion", numbers: ["21", "12"] },
    { dream: "monkey", numbers: ["08", "80"] },
    { dream: "horse", numbers: ["13", "31"] },
    { dream: "snake bite", numbers: ["12", "45"] },
    { dream: "river", numbers: ["16", "61"] },
    { dream: "rain", numbers: ["27", "72"] },
    { dream: "sun", numbers: ["19", "91"] },
    { dream: "moon", numbers: ["02", "20"] },
    { dream: "star", numbers: ["07", "70"] },
    { dream: "flower", numbers: ["23", "32"] },
    { dream: "gold", numbers: ["24", "42"] },
    { dream: "diamond", numbers: ["35", "53"] },
    { dream: "ring", numbers: ["28", "82"] },
    { dream: "temple", numbers: ["33", "39"] },
    { dream: "blood", numbers: ["14", "41"] },
    { dream: "fight", numbers: ["11", "47"] },
    { dream: "accident", numbers: ["36", "63"] },
    { dream: "crying", numbers: ["38", "83"] },
    { dream: "laughing", numbers: ["26", "62"] },
    { dream: "old man", numbers: ["34", "43"] },
    { dream: "old woman", numbers: ["22", "44"] },
    { dream: "child", numbers: ["01", "10"] },
    { dream: "pregnant", numbers: ["25", "52"] },
    { dream: "clothes", numbers: ["29", "92"] },
    { dream: "shoes", numbers: ["31", "13"] },
    { dream: "bus", numbers: ["46", "64"] },
    { dream: "train", numbers: ["48", "84"] },
    { dream: "airplane", numbers: ["49", "94"] },
    { dream: "bicycle", numbers: ["15", "51"] },
    { dream: "road", numbers: ["37", "73"] },
    { dream: "bridge", numbers: ["39", "93"] },
    { dream: "mountain", numbers: ["43", "34"] },
    { dream: "field", numbers: ["56", "65"] },
    { dream: "forest", numbers: ["58", "85"] },
    { dream: "school", numbers: ["57", "75"] },
    { dream: "exam", numbers: ["59", "95"] },
    { dream: "teacher", numbers: ["66", "69"] },
    { dream: "doctor", numbers: ["67", "76"] },
    { dream: "police", numbers: ["68", "86"] },
    { dream: "soldier", numbers: ["78", "87"] },
    { dream: "king", numbers: ["77", "99"] },
    { dream: "thief", numbers: ["44", "88"] },
    { dream: "god", numbers: ["00", "01"] },
    { dream: "goddess", numbers: ["02", "22"] },
    { dream: "prayer", numbers: ["03", "33"] },
    { dream: "singing", numbers: ["55", "50"] },
    { dream: "dancing", numbers: ["54", "45"] },
    { dream: "cooking", numbers: ["52", "25"] },
    { dream: "eating", numbers: ["53", "35"] },
    { dream: "swimming", numbers: ["16", "61"] },
    { dream: "flying", numbers: ["49", "94"] },
    { dream: "falling", numbers: ["36", "63"] },
    { dream: "running", numbers: ["47", "74"] },
    { dream: "knife", numbers: ["14", "41"] },
    { dream: "gun", numbers: ["48", "84"] },
    { dream: "bed", numbers: ["42", "24"] },
    { dream: "mirror", numbers: ["46", "64"] },
    { dream: "key", numbers: ["38", "83"] },
    { dream: "lock", numbers: ["39", "93"] },
    { dream: "book", numbers: ["57", "75"] },
    { dream: "letter", numbers: ["58", "85"] },
    { dream: "phone", numbers: ["59", "95"] },
    { dream: "rice", numbers: ["56", "65"] },
    { dream: "milk", numbers: ["01", "10"] },
    { dream: "egg", numbers: ["00", "09"] },
    { dream: "fruit", numbers: ["23", "32"] },
    { dream: "vegetable", numbers: ["26", "62"] },
    { dream: "meat", numbers: ["14", "41"] },
    { dream: "alcohol", numbers: ["44", "88"] },
    { dream: "cigarette", numbers: ["36", "63"] },
    { dream: "medicine", numbers: ["67", "76"] },
    { dream: "hospital", numbers: ["68", "86"] },
    { dream: "funeral", numbers: ["10", "37"] },
    { dream: "wedding", numbers: ["20", "25"] },
    { dream: "birthday", numbers: ["01", "11"] },
    { dream: "festival", numbers: ["55", "99"] },
    { dream: "war", numbers: ["78", "87"] },
    { dream: "earthquake", numbers: ["36", "63"] },
    { dream: "flood", numbers: ["16", "61"] },
];

export default function AdminDreamsPage() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [currentDream, setCurrentDream] = useState<any>(null);

    const { data: dreamsData, isLoading } = useQuery({
        queryKey: ["admin-dreams"],
        queryFn: () => api.dreams.getAll()
    });

    const dreams = dreamsData?.data || [];

    const saveMutation = useMutation({
        mutationFn: (data: any) => {
            if (currentDream?.id) {
                return api.dreams.update(currentDream.id, data);
            }
            return api.dreams.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-dreams"] });
            setIsEditing(false);
            setCurrentDream(null);
            alert("Saved successfully!");
        },
        onError: (err: any) => {
            alert(`Failed to save: ${err.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.dreams.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-dreams"] });
        }
    });

    const migrateMutation = useMutation({
        mutationFn: () => api.dreams.migrate({ dreams: STATIC_DREAMS }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-dreams"] });
            alert(`Migration Complete! All ${STATIC_DREAMS.length} dreams imported.`);
        },
        onError: (err: any) => {
            alert(`Migration failed: ${err.message}`);
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(currentDream);
    };

    if (isLoading) return <div className="p-8 text-gray-500 font-medium">Loading SEO data...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Programmatic Dream SEO</h1>
                    <p className="text-gray-500 mt-2">Manage {dreams.length} programmatic SEO pages for Dream Numbers.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => migrateMutation.mutate()}
                        disabled={migrateMutation.isPending}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {migrateMutation.isPending ? "Migrating..." : `Import All ${STATIC_DREAMS.length} Dreams`}
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Target Numbers (comma separated)</label>
                            <input required type="text" value={currentDream.numbers} onChange={e => setCurrentDream({...currentDream, numbers: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 12, 45" />
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">SEO Metadata (For SEO Experts)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                                    <input type="text" value={currentDream.seoTitle || ""} onChange={e => setCurrentDream({...currentDream, seoTitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Highly optimized title..." />
                                    <p className="text-xs text-gray-400 mt-1">Recommended: 50-60 characters. Include primary keyword.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                                    <textarea value={currentDream.seoDesc || ""} onChange={e => setCurrentDream({...currentDream, seoDesc: e.target.value})} className="w-full px-4 py-2 border rounded-lg h-24" placeholder="Compelling description for CTR..."></textarea>
                                    <p className="text-xs text-gray-400 mt-1">Recommended: 150-160 characters. Include call-to-action.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Keywords</label>
                                    <input type="text" value={currentDream.keywords || ""} onChange={e => setCurrentDream({...currentDream, keywords: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="snake dream meaning teer, shillong teer snake number..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Long-form Body Content</label>
                                    <textarea value={currentDream.bodyText || ""} onChange={e => setCurrentDream({...currentDream, bodyText: e.target.value})} className="w-full px-4 py-2 border rounded-lg h-48 font-mono text-sm" placeholder="Write 300+ words of unique content to satisfy Google's Helpful Content requirements..."></textarea>
                                    <p className="text-xs text-gray-400 mt-1">Use **bold** for emphasis. Supports basic markdown on the frontend.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
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
                                    No dream pages found. Click &quot;Import All Dreams&quot; to bulk-import all {STATIC_DREAMS.length} dreams.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
