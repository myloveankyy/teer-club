"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, MessageCircle, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { staggerContainer, fadeUpItem } from "@/lib/motion";
import { CommentSection } from "@/components/CommentSection";

export function PredictionFeed({ isAuth }: { isAuth: boolean }) {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(0);
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

    const postsPerPage = 2;
    const currentFeed = feed.slice(startIndex, startIndex + postsPerPage);

    useEffect(() => {
        async function fetchFeed() {
            try {
                const res = await api.get('/feed');
                if (res.data.success) {
                    setFeed(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load prediction feed", err);
            } finally {
                setLoading(false);
            }
        }
        fetchFeed();
    }, []);

    const handleLike = async (id: number) => {
        if (!isAuth) return;

        // Optimistic UI update first
        const post = feed.find((p: any) => p.id === id);
        if (!post) return;
        const alreadyLiked = post.isLiked;

        setFeed(prev => prev.map((p: any) => {
            if (p.id === id) {
                return { ...p, likes: alreadyLiked ? p.likes - 1 : p.likes + 1, isLiked: !alreadyLiked };
            }
            return p;
        }));

        try {
            // Real API call — backend returns the authoritative like count
            const res = alreadyLiked
                ? await api.delete(`/feed/${id}/like`)
                : await api.post(`/feed/${id}/like`);

            if (res.data.success) {
                // Sync with real server count
                setFeed(prev => prev.map((p: any) =>
                    p.id === id ? { ...p, likes: res.data.likes } : p
                ));
            }
        } catch {
            // Revert optimistic update on failure
            setFeed(prev => prev.map((p: any) => {
                if (p.id === id) {
                    return { ...p, likes: alreadyLiked ? p.likes + 1 : p.likes - 1, isLiked: alreadyLiked };
                }
                return p;
            }));
        }
    };


    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 animate-pulse">
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100" />
                                <div className="space-y-2">
                                    <div className="w-20 h-3 bg-slate-100 rounded" />
                                    <div className="w-14 h-2 bg-slate-100 rounded" />
                                </div>
                            </div>
                            <div className="w-16 h-5 bg-slate-100 rounded-full" />
                        </div>
                        <div className="h-16 bg-slate-50 rounded-lg w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (feed.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-6"
            >
                <div className="w-14 h-14 mb-4 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <MessageCircle className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No predictions yet</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Be the first player to share your forecast today.</p>
            </motion.div>
        );
    }

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={startIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {currentFeed.map((post) => (
                        <motion.div
                            key={post.id}
                            variants={fadeUpItem}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                        >
                            <div className="p-4 md:p-5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                                            {post.author_name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{post.author_name || 'Anonymous User'}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <p className="text-[11px] font-medium text-slate-500">
                                                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[11px] font-bold text-rose-500">
                                                    {post.game_type} • {post.round}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Prediction Content */}
                                <div className="mb-4">
                                    {post.caption && (
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                            {post.caption}
                                        </p>
                                    )}

                                    <div className="bg-slate-50/80 rounded-lg p-5 border border-slate-100 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Number</p>
                                            {!isAuth ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-slate-900/10 blur-[1.5px]">88</span>
                                                    <span className="text-[10px] text-slate-300 italic">Locked</span>
                                                </div>
                                            ) : (
                                                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                                    {post.number}
                                                </span>
                                            )}
                                        </div>

                                        {isAuth && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Stake</p>
                                                <span className="text-base font-bold text-rose-500">₹{parseFloat(post.amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center gap-6 pt-3 border-t border-slate-50">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={cn(
                                            "flex items-center gap-2 transition-all",
                                            post.isLiked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"
                                        )}
                                    >
                                        <Heart className={cn("w-5 h-5", post.isLiked && "fill-current")} />
                                        <span className="text-xs font-semibold">{post.likes}</span>
                                    </button>

                                    <button
                                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                        className={cn(
                                            "flex items-center gap-2 transition-all",
                                            expandedPostId === post.id ? "text-indigo-600" : "text-slate-500 hover:text-indigo-600"
                                        )}
                                    >
                                        <MessageCircle className={cn("w-5 h-5", expandedPostId === post.id && "fill-current")} />
                                        <span className="text-xs font-semibold">{post.comments_count || 0} Replies</span>
                                    </button>
                                </div>

                                {/* Comment Section Toggle */}
                                <AnimatePresence>
                                    {expandedPostId === post.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <CommentSection
                                                betId={post.id}
                                                isAuth={isAuth}
                                                onCommentCountChange={(count) => {
                                                    setFeed(prev => prev.map(p => p.id === post.id ? { ...p, comments_count: count } : p));
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Mini Navigation */}
            {feed.length > postsPerPage && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setStartIndex(Math.max(0, startIndex - postsPerPage))}
                        disabled={startIndex === 0}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm active:scale-90"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-4 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {Math.floor(startIndex / postsPerPage) + 1} / {Math.ceil(feed.length / postsPerPage)}
                        </span>
                    </div>
                    <button
                        onClick={() => setStartIndex(Math.min(feed.length - postsPerPage, startIndex + postsPerPage))}
                        disabled={startIndex + postsPerPage >= feed.length}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm active:scale-90"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );
}
