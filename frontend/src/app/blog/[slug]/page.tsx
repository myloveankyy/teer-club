import markdownToHtml from '@/lib/markdownToHtml';
import editorjsToHtml from '@/lib/editorjsToHtml';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, Share2, User, TrendingUp, Star, Target, Zap, ChevronRight, ExternalLink, BarChart3, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShareButton } from '@/components/ShareButton';

type PostResponse = {
    success: boolean;
    data?: {
        id: number;
        title: string;
        slug: string;
        category: string;
        excerpt: string;
        content: string;
        featured_image: string;
        is_published: boolean;
        created_at: string;
        author_name: string;
        meta_title?: string;
        meta_description?: string;
        focus_keyword?: string;
        tags?: string;
    }
};

type RelatedPost = {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    featured_image: string;
    created_at: string;
};

async function getPost(slug: string): Promise<PostResponse['data'] | null> {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/public/posts/${slug}`, { next: { revalidate: 60 } });
        const data: PostResponse = await res.json();
        return data.success ? data.data : null;
    } catch (e) {
        console.error("Fetch DB post failed", e);
        return null;
    }
}

async function getRelatedPosts(currentSlug: string): Promise<RelatedPost[]> {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/public/posts?limit=4`, { next: { revalidate: 300 } });
        const data = await res.json();
        if (data.success) {
            return data.data.filter((p: RelatedPost) => p.slug !== currentSlug).slice(0, 3);
        }
        return [];
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const post = await getPost(resolvedParams.slug);
        if (!post) return { title: 'Post Not Found' };

        return {
            title: post.meta_title || `${post.title} | Teer Club`,
            description: post.meta_description || post.excerpt,
            keywords: post.focus_keyword ? post.focus_keyword.split(',').map(k => k.trim()) : [],
            openGraph: {
                title: post.meta_title || post.title,
                description: post.meta_description || post.excerpt,
                type: 'article',
                publishedTime: post.created_at,
                images: post.featured_image ? [post.featured_image] : [],
            }
        };
    } catch {
        return { title: 'Teer Club' };
    }
}

function estimateReadTime(content: string): number {
    const text = content.replace(/<[^>]+>/g, '');
    const words = text.split(/\s+/).length;
    return Math.max(3, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        const [post, relatedPosts] = await Promise.all([
            getPost(resolvedParams.slug),
            getRelatedPosts(resolvedParams.slug),
        ]);

        if (!post) notFound();

        let contentHtml = '';
        if (post.content.trim().startsWith('{') && post.content.includes('"blocks"')) {
            contentHtml = editorjsToHtml(post.content);
        } else if (post.content.trim().startsWith('<') || post.content.includes('<h2') || post.content.includes('<p>')) {
            contentHtml = post.content;
        } else {
            contentHtml = await markdownToHtml(post.content || '');
        }

        const readTime = estimateReadTime(post.content);
        const tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const publishDate = new Date(post.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });

        // Split content into 2 parts to inject promo widget in between
        const splitIndex = contentHtml.indexOf('</h2>', contentHtml.indexOf('</h2>') + 5);
        let contentPart1 = contentHtml;
        let contentPart2 = '';
        if (splitIndex > 0) {
            const nextTagStart = contentHtml.indexOf('<', splitIndex + 5);
            if (nextTagStart > 0) {
                contentPart1 = contentHtml.substring(0, nextTagStart);
                contentPart2 = contentHtml.substring(nextTagStart);
            }
        }

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.meta_title || post.title,
            "description": post.meta_description || post.excerpt,
            "image": post.featured_image ? [post.featured_image] : [],
            "datePublished": post.created_at,
            "dateModified": post.created_at,
            "author": [{ "@type": "Person", "name": post.author_name || "Teer Club Expert" }],
            "publisher": { "@type": "Organization", "name": "Teer Club", "url": "https://teer.club" }
        };

        const proseClasses = `prose prose-slate prose-lg max-w-none 
            prose-headings:text-slate-900 prose-headings:tracking-tight 
            prose-h2:text-[24px] prose-h2:md:text-[30px] prose-h2:font-extrabold prose-h2:mt-16 prose-h2:mb-8 prose-h2:leading-tight
            prose-h3:text-[20px] prose-h3:md:text-[24px] prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-6
            prose-p:text-[#3d3d3d] prose-p:leading-[1.9] prose-p:text-[18px] prose-p:mb-8 prose-p:font-medium
            prose-a:text-indigo-600 prose-a:font-semibold prose-a:no-underline prose-a:border-b prose-a:border-indigo-200 hover:prose-a:border-indigo-500 prose-a:transition-colors
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-em:text-slate-600 prose-em:font-medium
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
            prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-ul:my-5
            prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1.5 prose-ol:my-5
            prose-li:text-[#3d3d3d] prose-li:text-[16px] prose-li:leading-relaxed prose-li:pl-1
            prose-blockquote:border-l-[3px] prose-blockquote:border-indigo-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-indigo-50/80 prose-blockquote:to-transparent prose-blockquote:py-4 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-blockquote:my-8 prose-blockquote:text-[16px]
            prose-table:border prose-table:border-slate-200 prose-table:rounded-xl prose-table:overflow-hidden prose-table:my-8
            prose-thead:bg-slate-900 prose-thead:text-white
            prose-th:py-3.5 prose-th:px-4 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:tracking-wider
            prose-td:py-3 prose-td:px-4 prose-td:border-b prose-td:border-slate-100 prose-td:text-[15px]
            prose-tr:even:bg-slate-50/70
            marker:text-indigo-500 selection:bg-indigo-100`;

        return (
            <main className="min-h-screen bg-[#f5f5f0] text-slate-900 relative antialiased">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                {/* Sticky Top Bar */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-6">
                    <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14">
                        <Link href="/blog" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="hidden sm:inline">Back to Blog</span>
                            <span className="sm:hidden">Blog</span>
                        </Link>
                        <div className="flex items-center gap-1">
                            <span className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest mr-3">Share</span>
                            <ShareButton title={post.title} excerpt={post.excerpt} slug={post.slug} />
                        </div>
                    </div>
                </header>

                {/* Hero Section — Full Width */}
                <div className="bg-white border-b border-slate-200/80">
                    <div className="max-w-[800px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-8">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-full">
                                {post.category}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{publishDate}</span>
                        </div>

                        <h1 className="text-[28px] md:text-[42px] lg:text-[48px] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6 max-w-[720px]">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-8 max-w-[640px] font-[410]">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Author Row */}
                        <div className="flex items-center gap-4 pb-8 border-b border-slate-100">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">By {post.author_name || 'Teer Club Expert'}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-0.5">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {publishDate}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime} min read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Image — Edge to Edge Feel */}
                {post.featured_image && (
                    <div className="max-w-[960px] mx-auto px-4 md:px-6 -mt-0 mb-0">
                        <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-b-2xl md:rounded-2xl overflow-hidden shadow-xl relative mt-0 md:-mt-4">
                            <Image src={post.featured_image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 960px" priority />
                        </div>
                    </div>
                )}

                {/* Main Content Area — Two Column Layout */}
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-14">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Main Content Column */}
                        <article className="flex-1 min-w-0">
                            {/* Content Part 1 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-10 lg:p-12 mb-6">
                                <div className={proseClasses} dangerouslySetInnerHTML={{ __html: contentPart1 }} />
                            </div>

                            {/* Mid-Article Promo Widget */}
                            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-6 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-amber-300" />
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Free Tool</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 leading-tight">
                                        Get Today&apos;s AI-Predicted Common Numbers
                                    </h3>
                                    <p className="text-sm text-indigo-100 mb-5 max-w-md leading-relaxed">
                                        Our AI analyzes 10,000+ historical results to give you the most likely numbers for today. Updated every morning at 9 AM.
                                    </p>
                                    <Link href="/predictions" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-md">
                                        <Target className="w-4 h-4" />
                                        Check Predictions
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Content Part 2 */}
                            {contentPart2 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-10 lg:p-12 mb-6">
                                    <div className={proseClasses} dangerouslySetInnerHTML={{ __html: contentPart2 }} />
                                </div>
                            )}

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topics</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-8 mb-6">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Written By</p>
                                        <p className="text-lg font-extrabold text-slate-900 mb-1">{post.author_name || 'Teer Club Expert'}</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Senior editor at Teer Club with deep expertise in Meghalaya&apos;s teer lottery system. Covering results, strategies, and cultural insights since 2014.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
                                <div className="text-center">
                                    <h3 className="text-xl font-extrabold text-white mb-2">Never Miss Today&apos;s Results</h3>
                                    <p className="text-sm text-slate-400 mb-5">Get instant Shillong Teer, Khanapara Teer, and Juwai Teer results updated live.</p>
                                    <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-md">
                                        <Zap className="w-4 h-4" />
                                        View Live Results
                                    </Link>
                                </div>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="w-full lg:w-[340px] flex-shrink-0 space-y-6">
                            <div className="lg:sticky lg:top-20 space-y-6">

                                {/* Trending: Predictions Widget */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Trending Now</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <Link href="/predictions" className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                            <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-300 transition-colors leading-none mt-0.5">01</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">AI Predictions for Today</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Updated every morning</p>
                                            </div>
                                        </Link>
                                        <Link href="/dreams" className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                            <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-300 transition-colors leading-none mt-0.5">02</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">Dream Number Lookup</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Find your lucky number</p>
                                            </div>
                                        </Link>
                                        <Link href="/history" className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                            <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-300 transition-colors leading-none mt-0.5">03</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">Result History & Patterns</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Analyze past data</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Live Results Widget */}
                                <Link href="/" className="block group">
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Live Now</span>
                                        </div>
                                        <p className="text-lg font-extrabold text-white leading-tight mb-1">Today&apos;s Teer Results</p>
                                        <p className="text-xs text-emerald-100">Shillong • Khanapara • Juwai</p>
                                        <ChevronRight className="w-5 h-5 text-white/60 absolute bottom-5 right-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>

                                {/* Tools Widget */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Teer Tools</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: "Probability Calculator", href: "/tools", icon: "📊" },
                                            { label: "Dream Number Finder", href: "/dreams", icon: "🌙" },
                                            { label: "Result Analyzer", href: "/history", icon: "📈" },
                                            { label: "AI Predictions", href: "/predictions", icon: "🤖" },
                                        ].map(tool => (
                                            <Link key={tool.label} href={tool.href}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                                                <span className="text-base">{tool.icon}</span>
                                                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{tool.label}</span>
                                                <ExternalLink className="w-3 h-3 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Newsletter-style CTA */}
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-md">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star className="w-4 h-4 text-amber-400" />
                                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Join Teer Club</span>
                                    </div>
                                    <p className="text-sm font-extrabold text-white leading-snug mb-2">Unlock Premium Predictions</p>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">Join 50,000+ teer enthusiasts who trust our AI-powered predictions every day.</p>
                                    <Link href="/" className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                                        Get Started Free
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Related Articles — Full Width */}
                {relatedPosts.length > 0 && (
                    <div className="bg-white border-t border-slate-200/80 py-12 md:py-16">
                        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">More From Teer Club</h2>
                                <Link href="/blog" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map(rp => (
                                    <Link key={rp.id} href={`/blog/${rp.slug}`} className="group bg-[#f5f5f0] rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                                        <div className="aspect-[16/10] relative overflow-hidden">
                                            {rp.featured_image ? (
                                                <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-slate-200" />
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{rp.category}</span>
                                            <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {rp.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(rp.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Gradient */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            </main>
        );
    } catch (error) {
        console.error(error);
        notFound();
    }
}
