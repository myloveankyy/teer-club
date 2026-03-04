"use client";

import { useEffect, useState } from "react";
import { PenTool, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, Image as ImageIcon, Link as LinkIcon, Save, Eye, Sparkles, Loader2, Zap } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';

const EditorJsComp = dynamic(() => import('@/components/EditorJs'), {
    ssr: false,
    loading: () => <div className="p-8 text-center text-slate-500 font-medium border border-slate-200 rounded-xl bg-slate-50 animate-pulse">Initializing Block Editor...</div>
});

type BlogPost = {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    featured_image: string;
    is_published: boolean;
    views: number;
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;
    created_at: string;
};

export default function AdminBlogPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [error, setError] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "Tips & Tricks",
        excerpt: "",
        content: "",
        featured_image: "",
        is_published: false,
        meta_title: "",
        meta_description: "",
        focus_keyword: ""
    });

    const categories = ["Tips & Tricks", "Announcements", "Guides", "Strategies"];

    const fetchPosts = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError("");
        try {
            const res = await api.get('/admin/posts');
            if (res.data.success) {
                setPosts(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch posts", err);
            setError("Failed to load blog posts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) fetchPosts();
    }, [isAuthenticated, authLoading]);

    const handleOpenModal = (post: BlogPost | null = null) => {
        setError("");
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                slug: post.slug,
                category: post.category,
                excerpt: post.excerpt || "",
                content: post.content,
                featured_image: post.featured_image || "",
                is_published: post.is_published,
                meta_title: post.meta_title || "",
                meta_description: post.meta_description || "",
                focus_keyword: post.focus_keyword || ""
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: "", slug: "", category: "Tips & Tricks", excerpt: "", content: "", featured_image: "", is_published: false,
                meta_title: "", meta_description: "", focus_keyword: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !editingPost ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
        }));
    };

    const handleSavePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setError("");

        try {
            if (editingPost) {
                const res = await api.put(`/admin/posts/${editingPost.id}`, formData);
                if (res.data.success) {
                    setPosts(posts.map(p => p.id === editingPost.id ? res.data.data : p));
                    handleCloseModal();
                }
            } else {
                const res = await api.post('/admin/posts', formData);
                if (res.data.success) {
                    setPosts([res.data.data, ...posts]);
                    handleCloseModal();
                }
            }
        } catch (err: any) {
            console.error("Save failed", err);
            setError(err.response?.data?.error || "Failed to save post.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await api.delete(`/admin/posts/${id}`);
            if (res.data.success) {
                setPosts(posts.filter(p => p.id !== id));
            }
        } catch (err) {
            alert("Failed to delete post.");
        }
    };

    const handleAutoGenerate = async () => {
        setAiGenerating(true);
        setError("");
        try {
            const res = await api.post('/admin/auto-blog/generate', {}, { timeout: 120000 });
            if (res.data.success) {
                // Refresh posts list
                await fetchPosts();
                alert(`✅ AI Blog Post Published!\n\nTitle: ${res.data.data.title}\nSlug: ${res.data.data.slug}\n\n${res.data.data.image_generated ? '🖼️ Featured image generated' : '⚠️ Image generation skipped'}\n📡 Google Indexing pinged\n🗺️ Sitemap regenerated`);
            }
        } catch (err: any) {
            console.error("AI Generation failed", err);
            setError(err.response?.data?.error || "AI generation failed. Please try again.");
            alert(`❌ Generation Failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setAiGenerating(false);
        }
    };

    if (authLoading) return <div className="flex 1 items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <PenTool className="w-8 h-8 text-indigo-600" />
                        Blog Publisher
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Compose, manage, and publish content for the public site.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAutoGenerate}
                        disabled={aiGenerating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {aiGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating with AI...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                AI Generate Post
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Write New Post
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-500 font-medium">Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                        <PenTool className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No posts yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Create your first blog post to engage with the Teer Club community.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all">

                            {/* Card Image Area */}
                            <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {post.featured_image ? (
                                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-slate-300" />
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md rounded-md text-indigo-700 shadow-sm">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    {post.is_published ? (
                                        <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-md shadow-sm">
                                            <CheckCircle2 className="w-3 h-3" /> Published
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-amber-500 text-white rounded-md shadow-sm">
                                            <AlertCircle className="w-3 h-3" /> Draft
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">{post.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{post.excerpt || 'No excerpt provided.'}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" /> {post.views || 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleOpenModal(post)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Composer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {editingPost ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <PenTool className="w-5 h-5 text-indigo-600" />}
                                {editingPost ? 'Edit Post' : 'Compose New Post'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="post-form" onSubmit={handleSavePost} className="space-y-6">
                                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Post Title</label>
                                            <input
                                                required value={formData.title} onChange={handleTitleChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="e.g. Master the Khanapara Teer..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">URL Slug</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="URL identifier"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                                            <select
                                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Featured Image URL</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    value={formData.featured_image} onChange={e => setFormData({ ...formData, featured_image: e.target.value })}
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Short Excerpt</label>
                                            <textarea
                                                value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-[115px]"
                                                placeholder="A brief summary for the card view..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                                        <span>Gutenberg-style Block Editor</span>
                                        <span className="text-xs text-indigo-500">Press '/' for commands</span>
                                    </label>
                                    <EditorJsComp
                                        value={formData.content}
                                        onChange={val => setFormData({ ...formData, content: val })}
                                    />
                                </div>

                                <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-5">
                                    <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                                        Advanced SEO Settings
                                        <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-600 rounded">Boost Ranking</span>
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-700 mb-1">Meta Title</label>
                                            <input
                                                value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="Custom SEO Title (Optimal: 50-60 chars)"
                                                maxLength={60}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-700 mb-1">Meta Description</label>
                                            <textarea
                                                value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none resize-none h-20"
                                                placeholder="A compelling description for search engine results (Optimal: 150-160 chars)"
                                                maxLength={160}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-700 mb-1">Focus Keyword</label>
                                            <input
                                                value={formData.focus_keyword} onChange={e => setFormData({ ...formData, focus_keyword: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="e.g. teer logic secret, winning pattern"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Publish Status</h4>
                                        <p className="text-xs text-slate-500 font-medium">Make this post visible on the public website</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.is_published}
                                            onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit" form="post-form" disabled={actionLoading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingPost ? 'Update Post' : 'Publish Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
}
