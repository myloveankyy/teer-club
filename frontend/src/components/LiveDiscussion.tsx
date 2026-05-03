"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { io } from "socket.io-client";
import { env } from "@/lib/env";

const SOCKET_URL = env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:3001";

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Props {
  gameId?: string;
  date?: string;
}

export function LiveDiscussion({ gameId, date }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();

    if (!gameId) return;

    // Connect to WebSockets for real-time updates
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join_game", gameId);
    });

    socket.on("new_comment", (comment: Comment) => {
      // Append the new comment if it matches the current date scope (or if no date scope is set)
      if (!date || comment.createdAt.startsWith(date)) {
        setComments((prev) => [comment, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, date]);

  const fetchComments = async () => {
    try {
      const res = await api.comments.getAll({ gameId, date });
      if (res.data?.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await api.comments.create({
        content: newComment,
        author: author,
        gameId,
        date,
      });

      if (res.data?.success) {
        setNewComment("");
        // No need to fetchComments() because Socket.IO will broadcast the new comment to us instantly!
      } else {
        setError(res.data?.error || "Failed to post comment");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="mt-16 border-t border-gray-100 pt-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
          Live Discussion
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </h3>
        <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      <div className="mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-1/4">
              <input
                type="text"
                placeholder="Name (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm transition-all"
              />
            </div>
            <div className="w-full md:w-3/4 relative">
              <input
                type="text"
                required
                placeholder="Share your thoughts or target numbers..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={1000}
                className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div ref={scrollRef} className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm font-medium">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                  {comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">
                    {comment.author || 'Anonymous'}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
