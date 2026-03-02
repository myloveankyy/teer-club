'use client';

import { useState, useEffect } from 'react';
import {
    Rocket, Plus, Trash2, Check, X, Loader2, ChevronDown,
    Zap, Shield, Star, Megaphone, Bug
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ChangelogEntry {
    id: number;
    version: string;
    title: string;
    description: string;
    type: string;
    created_at: string;
}

const TYPE_CONFIG = {
    feature: { label: 'New Feature', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: <Star className="w-3.5 h-3.5" /> },
    improvement: { label: 'Improvement', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: <Zap className="w-3.5 h-3.5" /> },
    bugfix: { label: 'Bug Fix', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: <Bug className="w-3.5 h-3.5" /> },
    security: { label: 'Security', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Shield className="w-3.5 h-3.5" /> },
    announcement: { label: 'Announcement', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: <Megaphone className="w-3.5 h-3.5" /> },
};

export default function ChangelogAdminPage() {
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const [form, setForm] = useState({
        version: '',
        title: '',
        description: '',
        type: 'feature',
    });

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchEntries = async () => {
        try {
            const res = await api.get('changelog');
            if (res.data.success) setEntries(res.data.data);
        } catch (err) {
            console.error('Failed to fetch changelog', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEntries(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.version || !form.title || !form.description) {
            showToast('Please fill all required fields.', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('changelog', form);
            showToast('Changelog entry published!');
            setForm({ version: '', title: '', description: '', type: 'feature' });
            setShowForm(false);
            fetchEntries();
        } catch (err) {
            showToast('Failed to publish entry.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this changelog entry?')) return;
        setDeletingId(id);
        try {
            await api.delete(`changelog/${id}`);
            setEntries(prev => prev.filter(e => e.id !== id));
            showToast('Entry deleted.');
        } catch {
            showToast('Deletion failed.', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold transition-all animate-in slide-in-from-right-4",
                    toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                )}>
                    {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Rocket className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Changelog</h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-1 ml-[52px]">Publish product updates and announcements to users.</p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className={cn(
                        "flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold transition-all shadow-sm",
                        showForm
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'New Entry'}
                </button>
            </div>

            {/* Publish Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Publish New Update</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Version *</label>
                            <input
                                type="text"
                                value={form.version}
                                onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                                placeholder="e.g. v2.4.1"
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type *</label>
                            <div className="relative">
                                <select
                                    value={form.type}
                                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                    className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="feature">🚀 New Feature</option>
                                    <option value="improvement">⚡ Improvement</option>
                                    <option value="bugfix">🐛 Bug Fix</option>
                                    <option value="security">🛡️ Security</option>
                                    <option value="announcement">📣 Announcement</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="What's new in this update?"
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description *</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Describe the update in detail. Markdown is supported."
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                            {submitting ? 'Publishing...' : 'Publish Update'}
                        </button>
                    </div>
                </form>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['feature', 'improvement', 'bugfix', 'announcement'] as const).map(type => {
                    const count = entries.filter(e => e.type === type).length;
                    const cfg = TYPE_CONFIG[type];
                    return (
                        <div key={type} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none">{count}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{cfg.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Entries List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[24px] border border-dashed border-slate-200">
                    <Rocket className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No changelog entries yet</h3>
                    <p className="text-sm text-slate-400">Click "New Entry" to publish your first update.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map(entry => {
                        const cfg = TYPE_CONFIG[entry.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.announcement;
                        return (
                            <div key={entry.id} className="group bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 flex gap-5 hover:shadow-md transition-all">
                                <div className={cn("w-2 h-full min-h-[60px] rounded-full shrink-0", cfg.dot)} style={{ width: '3px' }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xs font-black text-slate-400 font-mono">{entry.version}</span>
                                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border", cfg.color)}>
                                                {cfg.icon}
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {new Date(entry.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={deletingId === entry.id}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                {deletingId === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 mb-2">{entry.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{entry.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
