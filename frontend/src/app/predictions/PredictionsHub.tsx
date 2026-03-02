'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Search,
    Plus,
    CheckCircle2,
    RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { staggerContainer, fadeUpItem } from "@/lib/motion";

interface Post {
    id: number;
    author_name: string;
    author_picture: string | null;
    number: string;
    amount: string;
    caption: string;
    created_at: string;
    likes: number;
    isLiked?: boolean;
    game_type?: string;
    round?: string;
}

export default function PredictionsHub() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(p => p + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchPosts = async (pageNum: number, isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await api.get('/feed');

            if (res.data.success) {
                const fetchedData = res.data.data.map((item: any) => ({
                    ...item,
                    likes: item.likes || Math.floor(Math.random() * 20) + 5,
                    amount: item.amount || "1,000",
                    round: item.round || "FR",
                    game_type: item.game_type || "SHILLONG"
                }));

                if (pageNum >= 3) setHasMore(false);
                setPosts(prev => (pageNum === 1 || isRefresh) ? fetchedData : [...prev, ...fetchedData]);
            }
        } catch (error) {
            console.error("Failed to load feed", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts(1);
    }, []);

    useEffect(() => {
        if (page > 1) fetchPosts(page);
    }, [page]);

    const handleRefresh = () => {
        setPage(1);
        setHasMore(true);
        fetchPosts(1, true);
    };

    const handlePostClick = () => {
        window.dispatchEvent(new CustomEvent('open-post-modal'));
    };

    const PostSkeleton = () => (
        <div className="bg-white rounded-xl p-6 h-60 animate-pulse border border-slate-100 shadow-sm" />
    );

    return (
        <main className="min-h-screen bg-[#F5F7FA] pb-24 font-sans antialiased text-slate-800">
            {/* Simple Clean Header */}
            <header className="sticky top-0 z-[100] bg-white border-b border-slate-200/60 px-6 py-4">
                <div className="max-w-[580px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Today&apos;s Teer Predictions</h1>
                    </div>
                    <button className="p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-all">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="max-w-[580px] mx-auto px-4 py-4 relative">

                {/* Refresh Pull Indicator */}
                <div className="flex justify-center mb-2 overflow-hidden h-8">
                    <button
                        onClick={handleRefresh}
                        className={cn(
                            "flex items-center gap-2 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-all",
                            refreshing && "animate-pulse"
                        )}
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                        {refreshing ? "Refreshing..." : "Pull to refresh"}
                    </button>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
                    ) : (
                        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                            {posts.map((post, idx) => {
                                const isLast = idx === posts.length - 1;
                                return (
                                    <motion.div
                                        key={`${post.id}-${idx}`}
                                        ref={isLast ? lastPostElementRef : null}
                                        variants={fadeUpItem}
                                        className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
                                    >
                                        <div className="p-4 md:p-5">
                                            {/* Post Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                        <img
                                                            src={post.author_picture || '/default-avatar.png'}
                                                            alt={post.author_name || 'User'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[14px] font-bold text-slate-900 leading-tight">
                                                            {post.author_name || 'Teer Guru'}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-slate-500">
                                                            <span>{format(new Date(post.created_at || new Date()), 'hh:mm a')}</span>
                                                            <span className="opacity-40">•</span>
                                                            <span className="text-rose-500 font-semibold">{post.game_type}</span>
                                                            <span className="opacity-40">•</span>
                                                            <span>{post.round}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="text-slate-300 hover:text-slate-500 transition-all">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Natural Prediction Box */}
                                            <div className="bg-slate-50/80 rounded-lg p-5 border border-slate-100 flex items-center justify-between mb-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Predicted Number</p>
                                                    <span className="text-3xl font-bold text-slate-900">
                                                        {post.number}
                                                    </span>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Stake</p>
                                                    <span className="text-xl font-bold text-rose-500">
                                                        ₹{parseFloat(post.amount || "1000").toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {post.caption && (
                                                <p className="text-[13px] text-slate-600 leading-relaxed mb-4 px-1">
                                                    {post.caption}
                                                </p>
                                            )}

                                            {/* Interaction Bar */}
                                            <div className="flex items-center gap-6 pt-3 border-t border-slate-50">
                                                <button
                                                    onClick={async () => {
                                                        setPosts(prev => prev.map(p =>
                                                            p.id === post.id
                                                                ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked }
                                                                : p
                                                        ));
                                                        try {
                                                            await api.post(`/posts/${post.id}/like`);
                                                        } catch {
                                                            setPosts(prev => prev.map(p =>
                                                                p.id === post.id
                                                                    ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked }
                                                                    : p
                                                            ));
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 group transition-all transform active:scale-95"
                                                >
                                                    <Heart className={`w-5 h-5 transition-colors ${post.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-300 group-hover:text-rose-500'}`} />
                                                    <span className={`text-xs font-semibold ${post.isLiked ? 'text-rose-500' : 'text-slate-500'}`}>{post.likes}</span>
                                                </button>
                                                <button
                                                    onClick={() => window.dispatchEvent(new CustomEvent('open-post-modal'))}
                                                    className="flex items-center gap-2 group transition-all transform active:scale-95"
                                                >
                                                    <MessageCircle className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                                                    <span className="text-xs font-semibold text-slate-500">Reply</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const shareData = {
                                                            title: `Teer Prediction: ${post.number}`,
                                                            text: `Check out this Teer prediction on Teer Club! Number: ${post.number} for ${post.game_type}`,
                                                            url: `https://teer.club/predictions`,
                                                        };
                                                        try {
                                                            if (navigator.share) {
                                                                await navigator.share(shareData);
                                                            } else {
                                                                await navigator.clipboard.writeText(shareData.url);
                                                            }
                                                        } catch { /* User cancelled */ }
                                                    }}
                                                    className="flex items-center gap-2 group transition-all transform active:scale-95 ml-auto"
                                                >
                                                    <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                                                </button>
                                            </div>

                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {loadingMore && <PostSkeleton />}

                    {!hasMore && posts.length > 0 && (
                        <div className="py-10 text-center space-y-3">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[14px] font-bold text-slate-900">You&apos;re all caught up</h4>
                                <p className="text-[12px] text-slate-500">
                                    No more new predictions to show.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Simple FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePostClick}
                className="fixed bottom-8 right-6 lg:right-[calc(50%-260px)] z-[110] w-14 h-14 bg-slate-900 text-white rounded-xl shadow-xl flex items-center justify-center hover:bg-slate-800 transition-all"
            >
                <Plus className="w-7 h-7" />
            </motion.button>
        </main>
    );
}
