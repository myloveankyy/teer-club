import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/data/blogs";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-12">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Related Articles</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
            >
              <Link href={`/blogs/${post.slug}`} className="block">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <span className="mb-2 inline-block rounded-full bg-[#eff6ff] px-2 py-1 text-xs font-medium text-[#2563eb]">
                    {post.category}
                  </span>
                  <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-[#2563eb] line-clamp-2">
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
        })}
      </div>
    </section>
  );
}
