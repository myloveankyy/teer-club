import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/data/blogs";

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "compact" | "horizontal";
}

const categoryColors: Record<string, string> = {
  Strategy: "bg-blue-600",
  Guide: "bg-emerald-600",
  Prediction: "bg-purple-600",
  "Dream Numbers": "bg-amber-600",
  Results: "bg-rose-600",
};

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const categoryColor = categoryColors[post.category] || "bg-gray-600";

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-6 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-lg">
        <Link href={`/blogs/${post.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
          />
        </Link>
        <div className="flex flex-col justify-center">
          <span className={`mb-2 inline-flex w-fit items-center gap-1.5 rounded-full ${categoryColor} px-2.5 py-0.5 text-xs font-semibold text-white`}>
            {post.category}
          </span>
          <Link href={`/blogs/${post.slug}`}>
            <h3 className="mb-1.5 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-[#2563eb]">
              {post.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <time dateTime={post.publishedAt}>{formattedDate}</time>
            <span>•</span>
            <span>{post.readingTime} min</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-lg">
        <Link href={`/blogs/${post.slug}`} className="block">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="p-4">
            <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full ${categoryColor} px-2.5 py-0.5 text-xs font-semibold text-white`}>
              {post.category}
            </span>
            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-[#2563eb]">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <time dateTime={post.publishedAt}>{formattedDate}</time>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-xl hover:-translate-y-1">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        
        <div className="p-6">
          <span className={`mb-3 inline-flex items-center gap-1.5 rounded-full ${categoryColor} px-3 py-1 text-xs font-semibold text-white`}>
            {post.category}
          </span>
          
          <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#2563eb]">
            {post.title}
          </h2>
          
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">{post.author}</span>
              <span>•</span>
              <time dateTime={post.publishedAt}>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#2563eb]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime} min
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
