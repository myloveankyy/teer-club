'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FileText, Trash2, AlertTriangle, Search, RefreshCw,
    ChevronLeft, ChevronRight, Target, MessageSquare,
    TrendingUp, Calendar, X, Send, ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type UserPost = {
    id: number;
    game_type: string;
    round: string;
    number: string;
    amount: string;
    caption: string | null;
    likes: number;
    created_at: string;
    user_id: number | null;
    username: string;
    email: string;
};

type ModalState = {
    type: 'delete' | 'warn';
    post: UserPost;
} | null;

const GAME_TYPES = ['', 'SHILLONG_TEER', 'KHANAPARA_TEER', 'JUWAI_TEER'];
const GAME_LABELS: Record<string, string> = {
    '': 'All Games',
    SHILLONG_TEER: 'Shillong',
    KHANAPARA_TEER: 'Khanapara',
    JUWAI_TEER: 'Juwai',
};

export default function PostsPage() {
    const [posts, setPosts] = useState<UserPost[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gameFilter, setGameFilter] = useState('');
    const [modal, setModal] = useState<ModalState>(null);
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const LIMIT = 25;

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
                ...(search && { search }),
                ...(gameFilter && { game_type: gameFilter }),
            });
            const res = await api.get(`/admin/user-posts?${params}`);
            setPosts(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch {
            toast.error('Failed to load posts');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, gameFilter]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1); }, [search, gameFilter]);

    const handleDelete = async () => {
        if (!modal || modal.type !== 'delete') return;
        setProcessing(true);
        try {
            const res = await api.delete(`/admin/user-posts/${modal.post.id}`, { data: { reason } });
            toast.success(res.data.message || 'Post deleted');
            setModal(null);
            setReason('');
            fetchPosts();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete post');
        } finally {
            setProcessing(false);
        }
    };

    const handleWarn = async () => {
        if (!modal || modal.type !== 'warn') return;
        setProcessing(true);
        try {
            const res = await api.post(`/admin/user-posts/${modal.post.id}/warn`, { reason });
            toast.success(res.data.message || 'Warning sent');
            setModal(null);
            setReason('');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to send warning');
        } finally {
            setProcessing(false);
        }
    };

    const totalPages = Math.ceil(total / LIMIT);

    const gameLabel = (type: string) => {
        const map: Record<string, { label: string; color: string }> = {
            SHILLONG_TEER: { label: 'Shillong', color: 'bg-rose-50 text-rose-700 border-rose-100' },
            KHANAPARA_TEER: { label: 'Khanapara', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            JUWAI_TEER: { label: 'Juwai', color: 'bg-violet-50 text-violet-700 border-violet-100' },
        };
        return map[type] || { label: type, color: 'bg-slate-50 text-slate-600 border-slate-100' };
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-violet-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Post Moderation</h1>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Review and moderate user-uploaded prediction posts. Remove content that violates T&C.
                    </p>
                </div>
                <button
                    onClick={fetchPosts}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Posts', value: total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'This Page', value: posts.length, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Total Likes', value: posts.reduce((s, p) => s + (p.likes || 0), 0), icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'With Caption', value: posts.filter(p => p.caption).length, icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by username, number, or caption..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 shadow-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {GAME_TYPES.map(g => (
                        <button
                            key={g}
                            onClick={() => setGameFilter(g)}
                            className={cn(
                                'px-3 py-2 rounded-lg text-xs font-bold transition-all',
                                gameFilter === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            {GAME_LABELS[g]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-700">User Prediction Posts</h2>
                        <span className="text-xs text-slate-400 font-medium">({total} total)</span>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/30">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Game</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Number</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stake</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caption</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Likes</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Posted</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(8)].map((_, j) => (
                                            <td key={j} className="py-4 px-5">
                                                <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <FileText className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold text-sm">No posts found</p>
                                        <p className="text-slate-300 text-xs mt-1">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                posts.map(post => {
                                    const game = gameLabel(post.game_type);
                                    return (
                                        <tr key={post.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="py-3.5 px-5">
                                                <p className="font-bold text-slate-900 text-sm">@{post.username}</p>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{post.email}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', game.color)}>
                                                    {game.label}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{post.round}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="text-2xl font-black text-slate-900 font-mono">{post.number}</span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="font-bold text-slate-700 text-sm">₹{Number(post.amount).toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="py-3.5 px-5 max-w-[200px]">
                                                {post.caption ? (
                                                    <p className="text-xs text-slate-600 truncate" title={post.caption}>{post.caption}</p>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3 text-rose-400" />
                                                    <span className="text-sm font-bold text-slate-700">{post.likes || 0}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <p className="text-[10px] text-slate-300 mt-0.5">
                                                    {new Date(post.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setModal({ type: 'warn', post }); setReason(''); }}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[11px] font-bold hover:bg-amber-100 transition-colors"
                                                        title="Warn user without deleting"
                                                    >
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Warn
                                                    </button>
                                                    <button
                                                        onClick={() => { setModal({ type: 'delete', post }); setReason(''); }}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors"
                                                        title="Delete post & notify user"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            {modal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => { setModal(null); setReason(''); }}
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-[440px] shadow-2xl overflow-hidden z-10">
                        {/* Top accent */}
                        <div className={`h-1.5 w-full ${modal.type === 'delete' ? 'bg-red-500' : 'bg-amber-400'}`} />
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${modal.type === 'delete' ? 'bg-red-50' : 'bg-amber-50'}`}>
                                    {modal.type === 'delete'
                                        ? <Trash2 className="w-5 h-5 text-red-600" />
                                        : <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    }
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        {modal.type === 'delete' ? 'Remove Post' : 'Warn User'}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {modal.type === 'delete'
                                            ? `Delete post #${modal.post.id} by @${modal.post.username} and notify them.`
                                            : `Send a T&C warning to @${modal.post.username} without removing their post.`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Post preview */}
                            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                                        <span className="font-black text-slate-700 text-sm">{modal.post.number}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{modal.post.game_type.replace(/_/g, ' ')} · {modal.post.round}</p>
                                        <p className="text-xs text-slate-400">{modal.post.caption || 'No caption'}</p>
                                    </div>
                                </div>
                            </div>

                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Reason <span className="text-slate-300">(sent to user)</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder={modal.type === 'delete'
                                    ? 'e.g. Spam, misleading content, violates T&C...'
                                    : 'e.g. Please review our community guidelines...'}
                                rows={3}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300"
                            />

                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={() => { setModal(null); setReason(''); }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={modal.type === 'delete' ? handleDelete : handleWarn}
                                    disabled={processing}
                                    className={cn(
                                        'flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50',
                                        modal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
                                    )}
                                >
                                    {processing
                                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : modal.type === 'delete'
                                            ? <><Trash2 className="w-4 h-4" /> Remove Post</>
                                            : <><Send className="w-4 h-4" /> Send Warning</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
