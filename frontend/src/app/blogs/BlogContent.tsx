"use client";

import { useState } from "react";
import type { BlogPost } from "@/data/blogs";
import { BlogCard, CategoryFilter, NewsletterCTA } from "@/components/blog";
import { BlogHero } from "@/components/blog/BlogHero";

interface BlogContentProps {
  posts: BlogPost[];
  featuredPost: BlogPost;
  trendingPosts: BlogPost[];
}

export function BlogContent({ posts, featuredPost, trendingPosts }: BlogContentProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);

  return (
    <>
      <BlogHero featuredPost={featuredPost} />

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Trending Teer Insights
              </h2>
              <p className="mt-2 text-gray-600">Most read articles this week</p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-2 w-2 rounded-full bg-[#2563eb]" />
              <div className="flex h-2 w-2 rounded-full bg-gray-300" />
              <div className="flex h-2 w-2 rounded-full bg-gray-300" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trendingPosts.map((post) => (
              <BlogCard key={post.slug} post={post} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      <section id="all-articles" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              All Articles
            </h2>
            <p className="mt-2 text-gray-600">Explore our complete collection of Teer insights</p>
          </div>
          <CategoryFilter posts={posts} onFilterChange={setFilteredPosts} />
          {filteredPosts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No articles found</h3>
              <p className="text-gray-600">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <NewsletterCTA />
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Explore More Resources
            </h2>
            <p className="mt-2 text-gray-600">
              Enhance your Teer experience with our other tools and guides.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/live"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#2563eb]/30 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Results</h3>
                <p className="text-sm text-gray-500">Real-time updates</p>
              </div>
            </a>

            <a
              href="/common-numbers"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#2563eb]/30 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Common Numbers</h3>
                <p className="text-sm text-gray-500">Daily predictions</p>
              </div>
            </a>

            <a
              href="/dreams"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#2563eb]/30 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dream Numbers</h3>
                <p className="text-sm text-gray-500">Traditional meanings</p>
              </div>
            </a>

            <a
              href="/teer-guide"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#2563eb]/30 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Teer Guide</h3>
                <p className="text-sm text-gray-500">Complete guide</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
