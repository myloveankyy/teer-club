"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, CornerDownRight, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Comment {
    id: number;
    bet_id: number;
    user_id: number;
    parent_id: number | null;
    content: string;
    created_at: string;
    username: string;
    profile_picture: string | null;
    user_status?: string;
}

interface CommentSectionProps {
    betId: number;
    isAuth: boolean;
    onCommentCountChange?: (count: number) => void;
}

export function CommentSection({ betId, isAuth, onCommentCountChange }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [betId]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comments/${betId}`);
            if (res.data.success) {
                setComments(res.data.data);
                if (onCommentCountChange) onCommentCountChange(res.data.count);
            }
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuth || !newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const res = await api.post("/comments", {
                bet_id: betId,
                content: newComment,
                parent_id: replyTo?.id || null
            });

            if (res.data.success) {
                const addedComment = res.data.data;
                setComments(prev => [...prev, addedComment]);
                setNewComment("");
                setReplyTo(null);
                if (onCommentCountChange) onCommentCountChange(comments.length + 1);
            }
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await api.delete(`/comments/${id}`);
            if (res.data.success) {
                setComments(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
                if (onCommentCountChange) fetchComments(); // Recalculate accurately
            }
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    // Organize comments into threads
    const mainComments = comments.filter(c => !c.parent_id);
    const visibleComments = showAll ? mainComments : mainComments.slice(0, 3);

    const getReplies = (parentId: number) => comments.filter(c => c.parent_id === parentId);

    return (
        <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
            {/* Input Area */}
            {isAuth ? (
                <form onSubmit={handleSubmit} className="relative group">
                    {replyTo && (
                        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 rounded-t-xl border-x border-t border-slate-100 text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3" />
                                Replying to @{replyTo.username}
                            </span>
                            <button type="button" onClick={() => setReplyTo(null)}>
                                <X className="w-3 h-3 hover:text-rose-500" />
                            </button>
                        </div>
                    )}
                    <div className={cn(
                        "flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 transition-all",
                        replyTo ? "rounded-b-2xl" : "rounded-2xl",
                        "focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5"
                    )}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-slate-700 placeholder:text-slate-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-90"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Login to comment</p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {visibleComments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                        {/* Main Comment */}
                        <div className="flex gap-3 group/comment">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <img
                                    src={comment.profile_picture || '/default-avatar.png'}
                                    alt={comment.username}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[12px] font-bold text-slate-900">@{comment.username}</h5>
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                <div className="flex items-center gap-4 pt-1">
                                    <button
                                        onClick={() => setReplyTo(comment)}
                                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider"
                                    >
                                        Reply
                                    </button>
                                    <button className="opacity-0 group-hover/comment:opacity-100 transition-opacity" onClick={() => handleDelete(comment.id)}>
                                        <Trash2 className="w-3 h-3 text-slate-300 hover:text-rose-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        {getReplies(comment.id).map(reply => (
                            <div key={reply.id} className="flex gap-3 ml-11 group/reply">
                                <div className="w-6 h-6 shrink-0 rounded-full bg-slate-50 overflow-hidden border border-slate-100">
                                    <img
                                        src={reply.profile_picture || '/default-avatar.png'}
                                        alt={reply.username}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[11px] font-bold text-slate-700">@{reply.username}</h5>
                                        <span className="text-[9px] font-medium text-slate-400">
                                            {new Date(reply.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{reply.content}</p>
                                    <button className="opacity-0 group-hover/reply:opacity-100 transition-opacity" onClick={() => handleDelete(reply.id)}>
                                        <Trash2 className="w-3 h-3 text-slate-300 hover:text-rose-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {mainComments.length > 3 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {showAll ? (
                            <>Hide Comments <ChevronUp className="w-3 h-3" /></>
                        ) : (
                            <>View All {mainComments.length} Comments <ChevronDown className="w-3 h-3" /></>
                        )}
                    </button>
                )}

                {comments.length === 0 && !loading && (
                    <div className="py-4 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No comments yet. Start the conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
