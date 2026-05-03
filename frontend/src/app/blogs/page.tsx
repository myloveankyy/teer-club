import type { Metadata } from "next";
import { PageLayout } from "@/components/shared/PageLayout";
import { BlogContent } from "./BlogContent";
import api from "@/lib/api";
import { TrafficGrid } from "@/components/layout/TrafficGrid";

export const metadata: Metadata = {
  title: "Teer Blog | Latest Insights, Strategies & Guides | Teer.club",
  description:
    "Read the latest Teer blogs covering number strategies, game guides, market updates, and expert insights for Shillong Teer, Khanapara Teer, and more.",
  keywords: [
    "Teer Blog",
    "Teer Strategies",
    "Teer Guide",
    "Shillong Teer",
    "Khanapara Teer",
    "Teer Tips",
    "Teer News",
    "Teer Prediction",
    "Common Numbers",
  ],
  openGraph: {
    title: "Teer Blog | Latest Insights, Strategies & Guides",
    description:
      "Read the latest Teer blogs covering number strategies, game guides, and expert insights.",
    type: "website",
    locale: "en_US",
    siteName: "Teer Club",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Teer.club Blog",
  description: "Latest insights, strategies and guides for Teer players",
  url: "https://teer.club/blogs",
  publisher: {
    "@type": "Organization",
    name: "Teer.club",
    url: "https://teer.club",
  },
};

export default async function BlogsPage() {
  let mappedPosts: any[] = [];
  try {
    const res = await api.pages.getAll({ type: "BLOG", status: "ACTIVE", limit: 20 });
    const rawPages = res.data?.data?.pages || [];

    mappedPosts = rawPages.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.meta_description || (p.content || "").substring(0, 150) + "...",
      coverImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1200&auto=format&fit=crop",
      author: "Teer.club Expert",
      publishedAt: p.created_at || new Date().toISOString(),
      readingTime: Math.max(2, Math.ceil((p.content_length || 500) / 200)),
      category: "Insights",
      content: p.content,
      keywords: p.meta_title ? p.meta_title.split(" ") : [],
      tableOfContents: [],
      relatedSlugs: []
    }));
  } catch {
    // Silent fail during build — page renders with empty state
  }

  const featuredPost = mappedPosts[0];
  const trendingPosts = mappedPosts.slice(1, 4);

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="flex-1">
        {mappedPosts.length > 0 ? (
          <>
            <TrafficGrid />
            <BlogContent
              posts={mappedPosts}
              featuredPost={featuredPost}
              trendingPosts={trendingPosts}
            />
          </>
        ) : (
          <div className="py-32 flex justify-center text-gray-500 font-medium">
            No blog posts found in database. Please generate some using the Admin Panel.
          </div>
        )}
      </main>
    </PageLayout>
  );
}
