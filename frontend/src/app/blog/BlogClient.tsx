'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    Clock,
    ArrowRight,
    Sparkles,
    LayoutGrid,
    Target,
    Brain,
    Globe,
    Compass,
    ChevronRight,
    Search,
    TrendingUp,
    ChevronLeft,
    Moon
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeUpItem } from '@/lib/motion';

type BlogPost = {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    featured_image: string;
    created_at: string;
    author_name: string;
};

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'all': return <LayoutGrid className="w-4 h-4" />;
        case 'strategy': return <Target className="w-4 h-4" />;
        case 'psychology': return <Brain className="w-4 h-4" />;
        case 'culture': return <Globe className="w-4 h-4" />;
        default: return <Compass className="w-4 h-4" />;
    }
}

export default function BlogClient() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/public/posts');
                if (res.data.success) {
                    setPosts(res.data.data);
                }
            } catch (err: any) {
                console.error("Failed to load blog posts:", err?.message || err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(posts.map(post => post.category)));
        return ['All', ...uniqueCats];
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (selectedCategory === 'All') return posts;
        return posts.filter(post => post.category === selectedCategory);
    }, [posts, selectedCategory]);

    const featuredPost = filteredPosts[0];
    const regularPosts = filteredPosts.slice(1);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Insights...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-32 relative font-sans antialiased">
            <div className="fixed top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white/50 to-transparent pointer-events-none z-0" />

            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
                <div className="max-w-[1100px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h1 className="text-lg font-bold text-slate-900">Knowledge Hub</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 px-4 md:px-6 max-w-[1100px] mx-auto pt-14">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-3">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Industry Knowledge</span>
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">
                            Insights & <span className="text-indigo-600">Strategy</span>
                        </h2>
                        <p className="text-slate-500 text-[15px] max-w-lg leading-relaxed">
                            Deep dives into Teer psychology, cultural philosophy, and advanced winning patterns.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-80">
                        <Search className="w-4 h-4 text-slate-400 ml-2" />
                        <input type="text" placeholder="Search articles..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400" />
                    </div>
                </div>

                <div className="sticky top-[84px] z-50 mb-12 bg-[#F8FAFC]/50 backdrop-blur-sm py-2">
                    <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <button key={cat} onClick={() => setSelectedCategory(cat)}
                                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap",
                                        isActive ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
                                    <span className={cn("transition-colors", isActive ? "text-indigo-400" : "text-slate-400")}>
                                        {getCategoryIcon(cat)}
                                    </span>
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={selectedCategory} variants={staggerContainer} initial="hidden" animate="visible" className="space-y-12">
                        {featuredPost && selectedCategory === 'All' && (
                            <motion.div variants={fadeUpItem}>
                                <Link href={`/blog/${featuredPost.slug}`}
                                    className="group relative flex flex-col lg:flex-row bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
                                    <div className="lg:w-3/5 aspect-[16/10] lg:aspect-auto overflow-hidden relative">
                                        {featuredPost.featured_image ? (
                                            <img src={featuredPost.featured_image} alt={featuredPost.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                                        )}
                                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-sm">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Featured Story</span>
                                        </div>
                                    </div>
                                    <div className="lg:w-2/5 p-8 md:p-10 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">{featuredPost.category}</span>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">{featuredPost.title}</h3>
                                        <p className="text-slate-500 text-[15px] leading-relaxed mb-8 line-clamp-3 md:line-clamp-4">{featuredPost.excerpt}</p>
                                        <div className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:gap-4 transition-all">
                                            <span>Start Reading</span>
                                            <ChevronRight className="w-4 h-4 text-indigo-500" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(selectedCategory === 'All' ? regularPosts : filteredPosts).map((post) => (
                                <motion.div key={post.slug} variants={fadeUpItem}>
                                    <Link href={`/blog/${post.slug}`}
                                        className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <div className="aspect-[16/10] overflow-hidden relative">
                                            {post.featured_image ? (
                                                <img src={post.featured_image} alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50" />
                                            )}
                                            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 backdrop-blur-sm border border-slate-100 text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{post.category}</div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-[19px] font-bold text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">{post.excerpt}</p>
                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                                <span className="text-[11px] font-bold text-slate-400">By {post.author_name}</span>
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {filteredPosts.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <BookOpen className="w-6 h-6 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No articles in this category</h3>
                                <p className="text-slate-500 text-sm">We&apos;re currently drafting new insights for you.</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <motion.section variants={fadeUpItem} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="mt-32 relative rounded-xl bg-slate-900 p-8 md:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(79,70,229,0.4),transparent)]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left space-y-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Stay Ahead of the Game</h3>
                            <p className="text-slate-400 text-sm md:text-base max-w-sm">Get the weekly analytics digest and strategy guide delivered to your inbox.</p>
                        </div>
                        <div className="flex w-full md:w-auto items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <input type="email" placeholder="Enter your email"
                                className="bg-transparent border-none outline-none pl-4 text-sm text-white placeholder:text-slate-500 w-full md:w-64" />
                            <button className="bg-white text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all">Subscribe</button>
                        </div>
                    </div>
                </motion.section>
            </div>
        </main>
    );
}
