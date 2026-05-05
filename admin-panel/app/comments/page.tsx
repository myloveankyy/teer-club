"use client";

import { useState, useEffect } from "react";
import api from "../api/client";

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [page, statusFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.comments.admin.getAll({ page, limit: 20, status: statusFilter || undefined });
      if (res.success) {
        setComments(res.data.comments);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await api.comments.admin.update(id, { status });
      if (res.success) {
        setComments(comments.map(c => c.id === id ? { ...c, status } : c));
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await api.comments.admin.delete(id);
      if (res.success) {
        setComments(comments.filter(c => c.id !== id));
      }
    } catch (err: any) {
      alert("Failed to delete comment: " + err.message);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comment Moderation</h1>
          <p className="text-sm text-gray-500">Manage user comments and live discussions</p>
        </div>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SPAM">Spam</option>
          </select>
          <button
            onClick={fetchComments}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && comments.length === 0 ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border-dashed border-2 border-gray-100 m-8 rounded-xl">
            No comments found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 flex gap-6 hover:bg-gray-50 transition-colors">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      comment.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      comment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {comment.status}
                    </span>
                    {comment.gameId && (
                      <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        Game: {comment.gameId}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[120px]">
                  {comment.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'APPROVED')}
                      className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                    >
                      Approve
                    </button>
                  )}
                  {comment.status !== 'SPAM' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'SPAM')}
                      className="px-3 py-1.5 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100"
                    >
                      Mark Spam
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
