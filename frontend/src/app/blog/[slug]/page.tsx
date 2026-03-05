import markdownToHtml from '@/lib/markdownToHtml';
import editorjsToHtml from '@/lib/editorjsToHtml';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Calendar, ArrowLeft, Clock, Share2, Bookmark, User } from 'lucide-react';
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
    }
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const post = await getPost(resolvedParams.slug);

        if (!post) {
            return { title: 'Post Not Found' };
        }

        return {
            title: post.meta_title || `${post.title} | Teer Club Knowledge Hub`,
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
    } catch (e) {
        return {
            title: 'Teer Club',
        };
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        const post = await getPost(resolvedParams.slug);

        if (!post) {
            notFound();
        }

        let contentHtml = '';
        if (post.content.trim().startsWith('{') && post.content.includes('"blocks"')) {
            contentHtml = editorjsToHtml(post.content);
        } else if (post.content.trim().startsWith('<') || post.content.includes('<h2') || post.content.includes('<p>')) {
            // Raw HTML from AI-generated posts — render directly
            contentHtml = post.content;
        } else {
            contentHtml = await markdownToHtml(post.content || '');
        }

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.meta_title || post.title,
            "description": post.meta_description || post.excerpt,
            "image": post.featured_image ? [post.featured_image] : [],
            "datePublished": post.created_at,
            "dateModified": post.created_at,
            "author": [{
                "@type": "Person",
                "name": post.author_name || "Teer Club Admin"
            }]
        };

        return (
            <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 relative font-sans antialiased">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* Immersive Ambient Glow */}
                <div className="fixed top-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white/50 to-transparent pointer-events-none z-0" />

                {/* Sub-Header / Local Nav */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
                    <div className="max-w-[800px] mx-auto flex items-center justify-between">
                        <Link href="/blog" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Library</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                                <Bookmark className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                <article className="relative z-10 px-4 md:px-0 max-w-[800px] mx-auto mt-12 md:mt-20">
                    {/* Meta Section */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
                                {post.category} Insight
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-[1.15] tracking-tight max-w-2xl">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200/60 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-slate-900">{post.author_name || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-300" />
                                <span>{new Date(post.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-300" />
                                <span>8 Min Read</span>
                            </div>
                        </div>
                    </div>

                    {post.featured_image && (
                        <div className="mb-16 w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 shadow-md relative">
                            <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 800px"
                                priority={true}
                            />
                        </div>
                    )}

                    {/* Enhanced Content Container */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-12 lg:p-16 mb-20 overflow-hidden">
                        <div
                            className="prose prose-slate max-w-none 
                                prose-headings:text-slate-900 prose-headings:tracking-tight 
                                prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
                                prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-[17px] prose-p:mb-6
                                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-slate-900 prose-strong:font-bold
                                prose-img:rounded-xl prose-img:shadow-lg
                                prose-ul:list-disc prose-ol:list-decimal
                                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-indigo-900
                                marker:text-indigo-500 selection:bg-indigo-100"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />

                        {/* Article Footer */}
                        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Written by {post.author_name || 'Admin'}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-indigo-500">Teer Club Resident Expert</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShareButton title={post.title} excerpt={post.excerpt} slug={post.slug} />
                            </div>
                        </div>
                    </div>
                </article>

                {/* Simplified Sticky Header Gradient */}
                <div className="fixed top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-[60] pointer-events-none" />
            </main>
        );
    } catch (error) {
        console.error(error);
        notFound();
    }
}
