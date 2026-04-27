import type { Metadata } from "next";
import { PageLayout } from "@/components/shared/PageLayout";
import { BlogContent } from "./BlogContent";
import { blogPosts } from "@/data/blogs";

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

export default function BlogsPage() {
  const featuredPost = blogPosts[0];
  const trendingPosts = blogPosts.slice(1, 4);

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="flex-1">
        <BlogContent
          posts={blogPosts}
          featuredPost={featuredPost}
          trendingPosts={trendingPosts}
        />
      </main>
    </PageLayout>
  );
}
