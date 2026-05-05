"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";

export default function GlobalSeoSettingsPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        defaultMetaTitle: "",
        metaDescription: "",
        defaultKeywords: "",
        canonicalUrlRule: "AUTO",
        indexEnabled: true,
        followEnabled: true,
        structuredDataJson: "",
    });

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["seoSettings"],
        queryFn: () => api.settings.seo.get(),
    });

    useEffect(() => {
        if (settingsData?.success && settingsData?.data) {
            setFormData({
                defaultMetaTitle: settingsData?.data?.defaultMetaTitle || "",
                metaDescription: settingsData?.data?.metaDescription || "",
                defaultKeywords: settingsData?.data?.defaultKeywords || "",
                canonicalUrlRule: settingsData?.data?.canonicalUrlRule || "AUTO",
                indexEnabled: settingsData?.data?.indexEnabled ?? true,
                followEnabled: settingsData?.data?.followEnabled ?? true,
                structuredDataJson: settingsData?.data?.structuredDataJson || "",
            });
        }
    }, [settingsData]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => api.settings.seo.update(data),
        onSuccess: () => {
            showToast("Global SEO architecture updated systematically", "success");
            queryClient.invalidateQueries({ queryKey: ["seoSettings"] });
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update SEO framework", "error");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.structuredDataJson) {
                JSON.parse(formData.structuredDataJson); // Validate JSON
            }
            updateMutation.mutate(formData);
        } catch (error) {
            showToast("Invalid JSON in structured data field.", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-64 flex-col gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                <span className="text-gray-500 font-medium">Resolving Search Nodes...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Global Domain SEO Controller</h1>
                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                    Command center for full domain-level search manipulation. Adjust white-hat indexing parameters, baseline meta injection schemas, and JSON-LD structured data payload targeting.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Robot & Spider Indexing Guidelines */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        Spider Crawl Directives
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Index Directive
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Allow search engines to index core pages.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, indexEnabled: !formData.indexEnabled })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.indexEnabled ? "bg-emerald-500" : "bg-gray-300"}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-sm ${formData.indexEnabled ? "translate-x-7" : "translate-x-1"}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Follow Links Directive
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">Allow spiders to navigate sub-urls.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, followEnabled: !formData.followEnabled })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.followEnabled ? "bg-purple-500" : "bg-gray-300"}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-sm ${formData.followEnabled ? "translate-x-7" : "translate-x-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Base Meta Configurations */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </div>
                        Meta Schematics
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Global Meta Title Template</label>
                                <input
                                    type="text"
                                    value={formData.defaultMetaTitle}
                                    onChange={(e) => setFormData({ ...formData, defaultMetaTitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all text-gray-900"
                                    placeholder="Teer Result Today | Official Fast Live Update"
                                />
                                <p className="text-xs text-gray-500 mt-2 font-mono">Used internally as fallback head tag injected during Next SSR hydration</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Canonical Output System</label>
                                <select
                                    value={formData.canonicalUrlRule}
                                    onChange={(e) => setFormData({ ...formData, canonicalUrlRule: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all text-gray-900"
                                >
                                    <option value="AUTO">AUTO - Match EXACT Request URI Segment</option>
                                    <option value="ROOT_ONLY">ROOT_ONLY - Force to Homepage</option>
                                    <option value="CUSTOM">CUSTOM - Wait for Sub-page specific declaration</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Meta Description</label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all text-gray-900"
                                placeholder="Market leading source for authentic Meghalaya games..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sitewide High-Density Keywords (Comma separated)</label>
                            <input
                                type="text"
                                value={formData.defaultKeywords}
                                onChange={(e) => setFormData({ ...formData, defaultKeywords: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all text-gray-900"
                                placeholder="Shillong teer live, khanapara target, juwai house ending"
                            />
                        </div>
                    </div>
                </div>

                {/* Structured Data / SERP Rich Snippets */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40 border-l-4 border-l-amber-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            JSON-LD Data Engine
                        </h2>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">ADVANCED HACK TACTIC</span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Inject valid JSON-LD schema into the `{"<head>"}` context via `dangerouslySetInnerHTML`. Generates Rich Snippets globally. Useful for defining the Organization, LocalBusiness, or default Lottery result schema.
                    </p>

                    <textarea
                        value={formData.structuredDataJson}
                        onChange={(e) => setFormData({ ...formData, structuredDataJson: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-4 bg-[#1e1e1e] border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm text-green-400 transition-all font-medium"
                        placeholder='{ "@context": "https://schema.org", "@type": "Organization", "name": "Teer Club" }'
                    />
                </div>

                <div className="flex justify-center md:justify-end pt-8">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)]"
                    >
                        {updateMutation.isPending ? "COMPILING REGISTRY..." : "DEPLY SEO STRATEGY FLAG"}
                    </button>
                </div>
            </form>
        </div>
    );
}
