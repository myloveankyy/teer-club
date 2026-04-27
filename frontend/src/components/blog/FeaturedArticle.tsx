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
    month: "long",
    day: "numeric",
  });

  const categoryColor = categoryColors[post.category] || "bg-gray-600";

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all hover:shadow-2xl">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-r lg:from-black/20 lg:to-transparent" />
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 rounded-full ${categoryColor} px-4 py-1.5 text-sm font-semibold text-white`}>
                {post.category}
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-[#2563eb] lg:text-4xl">
              {post.title}
            </h2>
            <p className="mb-6 text-lg text-gray-600">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{post.author}</span>
              <span className="text-gray-300">•</span>
              <time dateTime={post.publishedAt}>{formattedDate}</time>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readingTime} min read
              </span>
            </div>
            <div className="mt-8 flex items-center gap-2 font-semibold text-[#2563eb]">
              <span>Read Article</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
