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
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden mt-8">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          Live Discussion
        </h3>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="md:col-span-2 relative">
              <input
                type="text"
                required
                placeholder="Share your target number or thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={1000}
                className="w-full px-4 py-2 pr-24 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="absolute right-1 top-1 bottom-1 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>

        <div ref={scrollRef} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm border-2 border-dashed border-gray-100 rounded-xl">
              No comments yet. Be the first to share your target number!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {comment.author}
                    </p>
                    <p className="text-xs text-gray-500 flex-shrink-0">
                      {timeAgo(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
