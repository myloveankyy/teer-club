import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageLayout } from "@/components/shared/PageLayout";
import {
  ReadingProgressBar,
  ShareButtons,
  MobileShareButtons,
  TableOfContents,
  RelatedPosts,
} from "@/components/blog";
import { blogPosts, getBlogBySlug, getRelatedPosts } from "@/data/blogs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Teer.club",
    };
  }

  return {
    title: `${post.title} | Teer.club Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
    alternates: {
      canonical: `/blogs/${post.slug}`,
    },
  };
}

const categoryColors: Record<string, string> = {
  Strategy: "bg-blue-600",
  Guide: "bg-emerald-600",
  Prediction: "bg-purple-600",
  "Dream Numbers": "bg-amber-600",
  Results: "bg-rose-600",
};

function renderContent(content: string): string {
  return content
    .trim()
    .replace(/^## (.+)$/gm, (_, title) => {
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return `<h2 id="${id}" class="group relative text-2xl font-bold text-gray-900 mt-14 mb-6 scroll-mt-24">
        <span class="absolute -left-4 top-0 h-full w-1 rounded-full bg-[#2563eb] opacity-0 transition-opacity group-hover:opacity-100"></span>
        ${title}
      </h2>`;
    })
    .replace(/^### (.+)$/gm, (_, title) => {
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return `<h3 id="${id}" class="text-xl font-semibold text-gray-900 mt-10 mb-4">${title}</h3>`;
    })
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-semibold text-gray-900 mt-8 mb-3">$1</h4>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700 mb-3 leading-relaxed">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 mb-3 leading-relaxed">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-[#2563eb]">$1</code>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split("|").filter(Boolean);
      if (cells.every((cell) => cell.trim().match(/^-+$/))) {
        return "";
      }
      const isHeader = cells.every((cell) => !cell.includes("-"));
      const cellTag = isHeader ? "th" : "td";
      const rowClass = isHeader ? "bg-gray-50" : "";
      return `<tr class="${rowClass}">${cells.map((cell) => `<${cellTag} class="border border-gray-200 px-4 py-3 ${isHeader ? "font-semibold" : ""}">${cell.trim()}</${cellTag}>`).join("")}</tr>`;
    })
    .replace(/(<tr[^>]*>[\s\S]*?<\/tr>)+/g, (match) => `<div class="overflow-x-auto"><table class="w-full border-collapse border border-gray-200 my-8 rounded-xl overflow-hidden">${match}</table></div>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#2563eb] hover:text-[#1d4ed8] hover:underline decoration-2 underline-offset-2 font-medium">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-[1.8] mb-6 text-[18px]">')
    .replace(/^(?!<[h|p|t|l|u|o|c|d])(.+)/gm, '<p class="text-gray-700 leading-[1.8] mb-6 text-[18px]">$1');
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.relatedSlugs);
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const categoryColor = categoryColors[post.category] || "bg-gray-600";

  const blogPostJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://teer.club",
    },
    publisher: {
      "@type": "Organization",
      name: "Teer.club",
      url: "https://teer.club",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://teer.club/blogs/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
  };

  const faqJsonLd = post.faq
    ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    }
    : null;

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <ReadingProgressBar />
      <main className="flex-1">
        <article>
          <header className="relative">
            <div className="relative h-[350px] w-full sm:h-[450px] lg:h-[550px]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 sm:px-6 lg:px-8 lg:pb-16">
              <div className="mx-auto max-w-4xl">
                <span className={`mb-5 inline-flex items-center gap-2 rounded-full ${categoryColor} px-4 py-1.5 text-sm font-semibold text-white`}>
                  {post.category}
                </span>
                <h1 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium">
                      T
                    </div>
                    <span className="font-medium text-white">{post.author}</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <time dateTime={post.publishedAt}>{formattedDate}</time>
                  <span className="text-white/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.readingTime} min read
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              <aside className="mb-10 lg:col-span-3">
                <div className="sticky top-24 space-y-6">
                  <div className="hidden lg:block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <ShareButtons title={post.title} url={`/blogs/${post.slug}`} />
                  </div>
                  {post.tableOfContents.length > 0 && (
                    <div className="hidden lg:block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <TableOfContents items={post.tableOfContents} />
                    </div>
                  )}
                  <div className="hidden lg:block rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <div className="mb-2 flex items-center gap-2 font-semibold text-amber-800">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Disclaimer
                    </div>
                    <p className="text-sm text-amber-700">
                      Teer is a game of chance. Blog content is for informational purposes only.
                    </p>
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-9">
                <div className="mx-auto max-w-[680px]">
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                  />

                  {post.faq && post.faq.length > 0 && (
                    <section className="mt-16">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                          <svg className="h-5 w-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                      </div>
                      <div className="space-y-4">
                        {post.faq.map((faq, idx) => (
                          <details
                            key={idx}
                            className="group rounded-xl border border-gray-200 bg-white transition-all"
                          >
                            <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-gray-900 hover:bg-gray-50">
                              {faq.question}
                              <svg
                                className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </summary>
                            <div className="border-t border-gray-100 p-5 text-gray-700 leading-relaxed">
                              {faq.answer}
                            </div>
                          </details>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-8">
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                    {post.keywords.slice(0, 5).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <section className="mt-16 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-8">
                    <h3 className="mb-6 text-xl font-bold text-gray-900">Explore More</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <a href="/live" className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-[#2563eb]/30 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Live Results</h4>
                          <p className="text-sm text-gray-500">Check today&apos;s results</p>
                        </div>
                      </a>
                      <a href="/common-numbers" className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-[#2563eb]/30 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Common Numbers</h4>
                          <p className="text-sm text-gray-500">Daily predictions</p>
                        </div>
                      </a>
                      <a href="/dream-numbers" className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-[#2563eb]/30 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Dream Numbers</h4>
                          <p className="text-sm text-gray-500">Traditional meanings</p>
                        </div>
                      </a>
                      <a href="/teer-guide" className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-[#2563eb]/30 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Teer Guide</h4>
                          <p className="text-sm text-gray-500">Complete guide</p>
                        </div>
                      </a>
                    </div>
                  </section>

                  {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <MobileShareButtons title={post.title} url={`/blogs/${post.slug}`} />
    </PageLayout>
  );
}
