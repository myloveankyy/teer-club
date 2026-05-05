"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/client";
import { useToast } from "@/components/Toast";
import { useState, useEffect, useRef } from "react";

export default function FaviconSettingsPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [faviconUrl, setFaviconUrl] = useState<string>("");
    const [appleTouchIconUrl, setAppleTouchIconUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const appleFileInputRef = useRef<HTMLInputElement>(null);

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["siteSettings"],
        queryFn: () => api.settings.get(),
    });

    useEffect(() => {
        if (settingsData?.success && settingsData?.data) {
            setFaviconUrl(settingsData?.data?.faviconUrl || "");
            setAppleTouchIconUrl(settingsData?.data?.appleTouchIconUrl || "");
        }
    }, [settingsData]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.settings.update({ ...settingsData?.data, ...data }),
        onSuccess: () => {
            showToast("Branding settings updated securely", "success");
            queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update branding", "error");
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ faviconUrl, appleTouchIconUrl });
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-64 flex-col gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="text-gray-500 font-medium">Loading Assets...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Favicon & Icons</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Instantly update website favicons across all browsers, PWA configurations, and iOS Apple-Touch overlays. Upload images to automatically encode them directly mapping to the SEO optimization pipeline without deploying server files.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Favicon Base Image */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        Standard Favicon Map
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="w-full md:w-32 flex-shrink-0 flex flex-col gap-3">
                            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shadow-inner">
                                {faviconUrl ? (
                                    <img src={faviconUrl} alt="Favicon Preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium">None</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload or Paste Base64 (.ico, .png, .svg)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        accept="image/png, image/x-icon, image/svg+xml"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileChange(e, setFaviconUrl)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md focus:ring-4 focus:ring-gray-200"
                                    >
                                        Browse File
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Direct URL / Base64 Output</label>
                                <input
                                    type="text"
                                    value={faviconUrl}
                                    onChange={(e) => setFaviconUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs text-gray-600 transition-all"
                                    placeholder="https://... or data:image/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apple Touch Icon */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2.5 bg-slate-800 rounded-xl text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        iOS Apple-Touch-Icon (PWA)
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="w-full md:w-32 flex-shrink-0 flex flex-col gap-3">
                            <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden shadow-inner">
                                {appleTouchIconUrl ? (
                                    <img src={appleTouchIconUrl} alt="Apple Touch Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium text-center px-2">180x180</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload or Paste Base64 (PNG highly recommended)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        accept="image/png"
                                        className="hidden"
                                        ref={appleFileInputRef}
                                        onChange={(e) => handleFileChange(e, setAppleTouchIconUrl)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => appleFileInputRef.current?.click()}
                                        className="px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all shadow-md focus:ring-4 focus:ring-slate-200"
                                    >
                                        Browse File
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Direct URL / Base64 Output</label>
                                <input
                                    type="text"
                                    value={appleTouchIconUrl}
                                    onChange={(e) => setAppleTouchIconUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-mono text-xs text-gray-600 transition-all"
                                    placeholder="https://... or data:image/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center md:justify-end pt-8">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)]"
                    >
                        {updateMutation.isPending ? "INJECTING METADATA..." : "ACTIVATE ICONS SECURELY"}
                    </button>
                </div>
            </form>
        </div>
    );
}
