"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/app/api/client";
import { useToast } from "@/components/Toast";
import { 
    Hash, Layers, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Search, Save 
} from "lucide-react";

export default function ProgrammaticSeoManager() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [titlePattern, setTitlePattern] = useState("");
    const [descPattern, setDescPattern] = useState("");

    const { data: templatesData, isLoading } = useQuery({
        queryKey: ["seoTemplates"],
        queryFn: () => api.seoDashboard.getTemplates()
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: (data: { templateGroup: string; titlePattern: string; descriptionPattern: string }) => 
            api.seoDashboard.bulkUpdate(data),
        onSuccess: (res) => {
            if (res.success) {
                showToast(`Successfully updated ${res.data.updated} pages`, "success");
                queryClient.invalidateQueries({ queryKey: ["seoTemplates"] });
                setTitlePattern("");
                setDescPattern("");
            } else {
                showToast(res.error || "Update failed", "error");
            }
        },
        onError: () => showToast("Bulk update failed", "error")
    });

    const handleBulkUpdate = (templateGroup: string) => {
        if (!titlePattern && !descPattern) {
            showToast("Please enter a title or description pattern to update.", "error");
            return;
        }
        if (confirm(`Are you sure you want to bulk update ${templateGroup} pages? This action cannot be easily undone.`)) {
            bulkUpdateMutation.mutate({ templateGroup, titlePattern, descriptionPattern: descPattern });
        }
    };

    if (isLoading) return <div className="p-10 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

    const templates = templatesData?.data || [];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Programmatic SEO</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Manage meta tags and schema across dynamic page templates in bulk.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Hash className="h-4 w-4 text-purple-500" /> Pattern Variables
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                    Use these variables in your title and description patterns. They will be dynamically replaced for each page.
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200">
                        {'{title}'} <span className="ml-2 font-sans font-normal text-gray-500">Original Page Title</span>
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200">
                        {'{url}'} <span className="ml-2 font-sans font-normal text-gray-500">Page URL</span>
                    </span>
                    {/* Expand variables in future (e.g. {gameName}, {date}) based on template logic */}
                </div>
            </div>

            <div className="space-y-4">
                {templates.map((t: any) => (
                    <div key={t.template} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedGroup(expandedGroup === t.template ? null : t.template)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 font-mono">{t.template}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm">
                                        <span className="text-gray-500"><b>{t.count}</b> pages</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500">Avg Score: <b className={t.avgScore >= 80 ? 'text-green-600' : t.avgScore >= 50 ? 'text-orange-500' : 'text-red-600'}>{t.avgScore}</b></span>
                                        {t.thinPages > 0 && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="h-3 w-3" /> {t.thinPages} Thin Pages</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400">
                                {expandedGroup === t.template ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                        </div>

                        {expandedGroup === t.template && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* Bulk Editor */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Bulk Edit Meta Patterns</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Title Pattern</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. {title} Result Today | Teer Club"
                                                    value={titlePattern}
                                                    onChange={(e) => setTitlePattern(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description Pattern</label>
                                                <textarea 
                                                    placeholder="e.g. Check the latest live {title} results instantly on Teer Club. Updated daily."
                                                    value={descPattern}
                                                    onChange={(e) => setDescPattern(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleBulkUpdate(t.template)}
                                                disabled={bulkUpdateMutation.isPending}
                                                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                                            >
                                                {bulkUpdateMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                                Apply to {t.count} Pages
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sample Pages */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Sample Pages ({t.pages.length})</h4>
                                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                            {t.pages.slice(0, 10).map((p: any) => (
                                                <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-semibold text-gray-900 line-clamp-1">{p.title}</span>
                                                        <span className={`text-xs font-bold px-2 rounded ${p.seo_score >= 80 ? 'bg-green-100 text-green-700' : p.seo_score >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                            {p.seo_score}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-400 block mb-2">{p.url}</span>
                                                    <div className="bg-gray-50 p-2 rounded text-xs border border-gray-100">
                                                        <p className="font-semibold text-blue-700 line-clamp-1">{p.meta_title || 'No Meta Title'}</p>
                                                        <p className="text-gray-600 line-clamp-2 mt-0.5">{p.meta_description || 'No Meta Description'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
