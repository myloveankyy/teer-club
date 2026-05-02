"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";

interface MonetizationSettings {
    isAdsEnabled: boolean;
    googleAdsenseClientId: string;
    headerAdUnit: string;
    inFeedAdUnit: string;
    stickyFooterAdUnit: string;
}

export default function MonetizationPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<MonetizationSettings | null>(null);

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["siteSettings"],
        queryFn: () => api.settings.get(),
    });

    useEffect(() => {
        if (settingsData?.success) {
            setFormData(settingsData.data);
        }
    }, [settingsData]);

    const updateMutation = useMutation({
        mutationFn: (data: MonetizationSettings) => api.settings.update(data),
        onSuccess: () => {
            showToast("Monetization settings updated successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update settings", "error");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            updateMutation.mutate(formData);
        }
    };

    if (isLoading || !formData) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl pb-20">
            <div className="mb-6 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">Monetization Hub</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage AdSense integrations, global ad toggles, and specific ad unit placements.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Global Kill Switch */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Global Ad Engine
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Enable or disable all ads across the entire platform instantly.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isAdsEnabled: !formData.isAdsEnabled })}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.isAdsEnabled ? "bg-emerald-600 shadow-lg shadow-emerald-200" : "bg-gray-300"}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${formData.isAdsEnabled ? "translate-x-7" : "translate-x-1"}`} />
                        </button>
                    </div>
                </div>

                {/* AdSense Configuration */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Network Configuration (Google AdSense)</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Publisher Client ID</label>
                            <input
                                type="text"
                                value={formData.googleAdsenseClientId || ""}
                                onChange={(e) => setFormData({ ...formData, googleAdsenseClientId: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                            />
                            <p className="mt-1 text-xs text-gray-500">Found in your AdSense account URL or tracking code.</p>
                        </div>
                    </div>
                </div>

                {/* Specific Ad Units */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Strategic Ad Slots</h2>
                    <p className="text-sm text-gray-500 mb-6">Paste your specific Ad Unit IDs (data-ad-slot) for high-converting placements.</p>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Above The Fold (Header Ad Unit)</label>
                            <input
                                type="text"
                                value={formData.headerAdUnit || ""}
                                onChange={(e) => setFormData({ ...formData, headerAdUnit: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                placeholder="1234567890"
                            />
                            <p className="mt-1 text-xs text-gray-500">Placed right below the navigation, before the results.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">In-Feed (Between Rounds Ad Unit)</label>
                            <input
                                type="text"
                                value={formData.inFeedAdUnit || ""}
                                onChange={(e) => setFormData({ ...formData, inFeedAdUnit: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                placeholder="0987654321"
                            />
                            <p className="mt-1 text-xs text-gray-500">Placed between the F/R and S/R result rows to catch scrolling users.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sticky Footer (Mobile Anchor Ad Unit)</label>
                            <input
                                type="text"
                                value={formData.stickyFooterAdUnit || ""}
                                onChange={(e) => setFormData({ ...formData, stickyFooterAdUnit: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                                placeholder="5555555555"
                            />
                            <p className="mt-1 text-xs text-gray-500">The highest-paying mobile format. Sticks to the bottom of the screen.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center md:justify-end pt-8">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 shadow-2xl shadow-gray-200 hover:-translate-y-1"
                    >
                        {updateMutation.isPending ? "PROCESSING..." : "SAVE AD SETTINGS"}
                    </button>
                </div>
            </form>
        </div>
    );
}
