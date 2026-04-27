"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";

interface SiteSettings {
    youtubeUrl: string;
    youtubeEnabled: boolean;
    whatsappUrl: string;
    whatsappEnabled: boolean;
    telegramUrl: string;
    telegramEnabled: boolean;
    bannerText: string;
    bannerVisible: boolean;
    bannerColor: string;
    resultAwaitedText: string;
    sundayOffText: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    cardStyle: string;
    borderRadius: string;
    playLiveUrl: string;
    playLiveEnabled: boolean;
}

export default function SiteSettingsPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<SiteSettings | null>(null);

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
        mutationFn: (data: SiteSettings) => api.settings.update(data),
        onSuccess: () => {
            showToast("Site settings updated successfully", "success");
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
                <h1 className="text-3xl font-bold text-gray-900">Site Configuration</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Control public UI elements, social links, and theme customization.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Theme Customization Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L17 13" />
                            </svg>
                        </div>
                        Theme Customization
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Colors */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Brand Colors</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50">
                                        <input
                                            type="color"
                                            value={formData.primaryColor || "#2563eb"}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="h-8 w-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
                                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50">
                                        <input
                                            type="color"
                                            value={formData.accentColor || "#22c55e"}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            className="h-8 w-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.accentColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background</label>
                                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50">
                                        <input
                                            type="color"
                                            value={formData.backgroundColor || "#ffffff"}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            className="h-8 w-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.backgroundColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color</label>
                                    <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50">
                                        <input
                                            type="color"
                                            value={formData.textColor || "#111827"}
                                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                            className="h-8 w-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.textColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Styles */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Visual Dynamics</h3>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Style</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['soft', 'glass', 'flat'].map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, cardStyle: style })}
                                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${formData.cardStyle === style ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-200"}`}
                                        >
                                            {style.charAt(0).toUpperCase() + style.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Corner Radius</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['sm', 'md', 'lg'].map((radius) => (
                                        <button
                                            key={radius}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, borderRadius: radius })}
                                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${formData.borderRadius === radius ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-200"}`}
                                        >
                                            {radius.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        Social Integration
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube Channel</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={formData.youtubeUrl || ""}
                                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                                        placeholder="https://youtube.com/..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, youtubeEnabled: !formData.youtubeEnabled })}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.youtubeEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200 text-gray-400"}`}
                                    >
                                        {formData.youtubeEnabled ? "ENABLED" : "DISABLED"}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Channel</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={formData.whatsappUrl || ""}
                                            onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                                            placeholder="https://wa.me/..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, whatsappEnabled: !formData.whatsappEnabled })}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.whatsappEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200 text-gray-400"}`}
                                        >
                                            {formData.whatsappEnabled ? "ON" : "OFF"}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telegram Group</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={formData.telegramUrl || ""}
                                            onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                                            placeholder="https://t.me/..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, telegramEnabled: !formData.telegramEnabled })}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.telegramEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200 text-gray-400"}`}
                                        >
                                            {formData.telegramEnabled ? "ON" : "OFF"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Announcement Banner Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        Announcement Hub
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                                <h4 className="font-bold text-gray-900">Broadcast Visibility</h4>
                                <p className="text-xs text-gray-500">Toggle the announcement banner on the public site.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, bannerVisible: !formData.bannerVisible })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.bannerVisible ? "bg-indigo-600" : "bg-gray-300"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.bannerVisible ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Message Content</label>
                            <textarea
                                value={formData.bannerText || ""}
                                onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                                placeholder="What's happening today?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Color</label>
                            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50 w-full md:w-64">
                                <input
                                    type="color"
                                    value={formData.bannerColor || "#2563eb"}
                                    onChange={(e) => setFormData({ ...formData, bannerColor: e.target.value })}
                                    className="h-8 w-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                />
                                <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.bannerColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Vocabularies Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        Status Vocabularies
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Result Awaited Placeholder</label>
                            <input
                                type="text"
                                value={formData.resultAwaitedText || ""}
                                onChange={(e) => setFormData({ ...formData, resultAwaitedText: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sunday Off Placeholder</label>
                            <input
                                type="text"
                                value={formData.sundayOffText || ""}
                                onChange={(e) => setFormData({ ...formData, sundayOffText: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Play Live Configuration Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-rose-50 rounded-lg">
                            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Live Play Configuration
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                                <h4 className="font-bold text-gray-900">Enable Play Widget</h4>
                                <p className="text-xs text-gray-500">Show the "Play Live" interactive card on the live page hero.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, playLiveEnabled: !formData.playLiveEnabled })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.playLiveEnabled ? "bg-rose-600" : "bg-gray-300"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.playLiveEnabled ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Play URL (Affiliate/Partner Link)</label>
                            <input
                                type="url"
                                value={formData.playLiveUrl || ""}
                                onChange={(e) => setFormData({ ...formData, playLiveUrl: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium transition-all"
                                placeholder="https://external-partner-link.com/..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center md:justify-end pt-8">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 shadow-2xl shadow-gray-200 hover:-translate-y-1"
                    >
                        {updateMutation.isPending ? "PROCESSING..." : "COMMIT ALL CHANGES"}
                    </button>
                </div>
            </form>
        </div>
    );
}
