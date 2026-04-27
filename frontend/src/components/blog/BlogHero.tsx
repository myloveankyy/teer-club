import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/data/blogs";

interface FeaturedArticleProps {
  post: BlogPost;
}

const categoryColors: Record<string, string> = {
  Strategy: "bg-blue-600",
  Guide: "bg-emerald-600",
  Prediction: "bg-purple-600",
  "Dream Numbers": "bg-amber-600",
  Results: "bg-rose-600",
};

export function FeaturedArticle({ post }: FeaturedArticleProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const categoryColor = categoryColors[post.category] || "bg-gray-600";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl lg:rounded-3xl lg:shadow-xl">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-[4/3]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        
        <div className="flex flex-1 flex-col p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 rounded-full ${categoryColor} px-3 py-1 text-xs font-semibold text-white`}>
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {post.category}
            </span>
            <span className="hidden text-xs font-medium text-gray-400 lg:block">
              Featured
            </span>
          </div>
          
          <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-[#2563eb] lg:text-2xl lg:font-extrabold lg:leading-tight">
            {post.title}
          </h2>
          
          <p className="mb-6 hidden text-sm leading-relaxed text-gray-600 lg:block lg:text-base">
            {post.excerpt}
          </p>
          
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#06b6d4] text-xs font-bold text-white">
                T
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">{post.author}</p>
                <p className="text-xs text-gray-500">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime} min
            </div>
          </div>
        </div>
      </Link>
      
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105">
          Read Article
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </article>
  );
}

interface BlogHeroProps {
  featuredPost: BlogPost;
}

export function BlogHero({ featuredPost }: BlogHeroProps) {
  const formattedDate = new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const categoryColor = categoryColors[featuredPost.category] || "bg-gray-600";

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fafbfc] to-[#f0f7ff]" />
      
      <div className="relative mx-auto max-w-[1200px] px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 hidden lg:block">
              <span className="inline-flex items-center gap-2.5 rounded-full bg-[#2563eb]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
                <span className="h-2 w-2 rounded-full bg-[#2563eb] animate-pulse" />
                Teer.Club Blog
              </span>
            </div>
            
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem] lg:font-extrabold lg:leading-[1.15] xl:text-5xl">
              Teer Strategies,{" "}
              <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">
                Dream Numbers
              </span>
              {" "}& Market Insights
            </h1>
            
            <p className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl lg:leading-relaxed">
              Daily Teer insights, number prediction guides, dream number meanings, and expert strategies 
              used by experienced players across Shillong, Khanapara, and Juwai markets.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#all-articles"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5"
              >
                Explore Latest Articles
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/teer-guide"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
              >
                Learn Teer Guide
                <svg className="h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </Link>
            </div>
            
            <div className="mt-10 hidden items-center gap-6 lg:flex">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expert Analysis</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Daily Updates</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Proven Strategies</span>
              </div>
            </div>
          </div>
          
          <div id="featured" className="relative">
            <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-gradient-to-br from-[#2563eb]/10 to-[#06b6d4]/10 blur-3xl" />
            
            <article className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl lg:rounded-3xl">
              <Link href={`/blogs/${featuredPost.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-[4/3]">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <span className={`mb-3 inline-flex items-center gap-2 rounded-full ${categoryColor} px-3 py-1 text-xs font-semibold text-white`}>
                      {featuredPost.category}
                    </span>
                    <h2 className="text-xl font-bold leading-snug text-white lg:text-2xl lg:font-extrabold">
                      {featuredPost.title}
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 lg:p-8">
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#06b6d4] text-sm font-bold text-white">
                        T
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{featuredPost.author}</p>
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {featuredPost.readingTime} min read
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2 font-semibold text-[#2563eb]">
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      Read Full Article
                    </span>
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </section>
  );
}
