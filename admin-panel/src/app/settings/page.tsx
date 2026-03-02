'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Settings2, Calculator, IndianRupee, RefreshCw, CheckCircle2, Upload, Globe, Share2 } from 'lucide-react';
import api from '@/lib/api';

type AppSettings = {
    shillong_rate: string;
    khanapara_rate: string;
    direct_rate: string;
    house_ending_rate: string;
    site_name: string;
    site_logo: string;
    site_favicon: string;
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings>({
        shillong_rate: '80',
        khanapara_rate: '82',
        direct_rate: '80',
        house_ending_rate: '10',
        site_name: 'Teer Club',
        site_logo: '',
        site_favicon: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('admin/settings');
            // Merge fetched settings with defaults incase some are missing
            setSettings(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg('');
        try {
            await api.put('admin/settings', settings);
            setSuccessMsg('Configurations saved successfully');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: keyof AppSettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'site_logo' | 'site_favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('admin/branding/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSettings(prev => ({ ...prev, [key]: res.data.url }));
            }
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Settings2 className="w-8 h-8 text-slate-700" />
                        System Configuration
                    </h2>
                    <p className="text-slate-500 mt-1">Manage global application variables and calculator rates.</p>
                </div>
                <div className="flex items-center gap-3">
                    {successMsg && (
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                            <CheckCircle2 className="w-4 h-4" /> {successMsg}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 justify-center bg-slate-900 border border-slate-900 shadow-xl shadow-slate-900/10 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Branding Section */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Site Branding</h3>
                            <p className="text-sm text-slate-500">Customize the identity, logo, and favicon of your platform.</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Site Display Name</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={(e) => handleChange('site_name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                placeholder="e.g. Teer Club"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Logo & Icon</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings.site_logo}
                                    onChange={(e) => handleChange('site_logo', e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-xs"
                                    placeholder="Logo URL or Upload"
                                />
                                <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0">
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'site_logo')} />
                                    <Upload className="w-4 h-4 text-slate-500" />
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Favicon</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings.site_favicon}
                                    onChange={(e) => handleChange('site_favicon', e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-xs"
                                    placeholder="Favicon URL or Upload"
                                />
                                <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0">
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'site_favicon')} />
                                    <Upload className="w-4 h-4 text-slate-500" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Calculator Rates Section */}
                <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Calculator & Payout Rates</h3>
                            <p className="text-sm text-slate-500">These multipliers are used across the frontend tools to project estimated winnings.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 text-slate-300 animate-spin" /></div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex justify-between">
                                    Shillong Default Rate
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.shillong_rate}
                                        onChange={(e) => handleChange('shillong_rate', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-medium text-sm">per ₹1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex justify-between">
                                    Khanapara Default Rate
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.khanapara_rate}
                                        onChange={(e) => handleChange('khanapara_rate', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-medium text-sm">per ₹1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex justify-between">
                                    Direct Rate (FC/Combo)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.direct_rate}
                                        onChange={(e) => handleChange('direct_rate', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-medium text-sm">per ₹1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex justify-between">
                                    House/Ending Rate
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.house_ending_rate}
                                        onChange={(e) => handleChange('house_ending_rate', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-medium text-sm">per ₹1</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className="md:col-span-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 text-indigo-800 text-sm font-medium">
                    <p><strong>Note:</strong> Adjusting these rates affects the projected winnings displayed to users in the Teer Checkers and Calculators across the main site. The industry standard is ₹80, but variations exist up to ₹82 for certain clubs.</p>
                </div>

                {/* Development & Updates Section */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-2">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Platform Updates</h3>
                                <p className="text-sm text-slate-500">Manage the public changelog and announcement feed for your users.</p>
                            </div>
                        </div>
                        <Link
                            href="/changelog"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                        >
                            Open Changelog Manager
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
