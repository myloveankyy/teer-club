import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { Button } from "@/components/ui/Button";
import { InlineAd } from "@/components/AdSlot";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let dream: any = null;
  try {
    const res = await api.dreams.getBySlug(slug);
    if (res.data?.success) {
      dream = res.data.data;
    }
  } catch (error) {
    return { title: "Dream Meaning Not Found | Teer Club" };
  }

  if (!dream) {
    return { title: "Dream Meaning Not Found | Teer Club" };
  }

  return {
    title: dream.seoTitle || `What does dreaming of a ${dream.dream} mean in Teer? Target Numbers`,
    description: dream.seoDesc || `Dreamt of a ${dream.dream}? Find the official Shillong and Khanapara Teer target numbers associated with this dream.`,
    keywords: dream.keywords || `${dream.dream} dream meaning teer, ${dream.dream} teer number`,
    alternates: {
      canonical: `/dreams/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const res = await api.dreams.getAll();
    if (res.data?.success && res.data.data) {
      return res.data.data.map((dream: any) => ({
        slug: dream.slug,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch dreams for static params", error);
  }
  return [];
}

export default async function DreamSeoPage({ params }: Props) {
  const { slug } = await params;
  let dream: any = null;
  let allDreams: any[] = [];
  
  try {
    const [dreamRes, allDreamsRes] = await Promise.all([
      api.dreams.getBySlug(slug),
      api.dreams.getAll()
    ]);
    
    if (dreamRes.data?.success) {
      dream = dreamRes.data.data;
    }
    if (allDreamsRes.data?.success) {
      allDreams = allDreamsRes.data.data;
    }
  } catch (error) {
    console.error("Failed to load dream SEO page", error);
  }

  if (!dream) {
    notFound();
  }

  // Shuffle and pick 6 related dreams
  const relatedDreams = allDreams
    .filter(d => d.id !== dream.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dream.seoTitle || `Dreaming of a ${dream.dream} - Teer Numbers`,
    description: dream.seoDesc,
    author: {
      "@type": "Organization",
      name: "Teer.club",
    },
    publisher: {
      "@type": "Organization",
      name: "Teer.club",
      url: "https://teer.club",
    },
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="flex-1 bg-surface">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100 bg-white">
            <Container>
                <div className="py-4 flex gap-2 text-sm font-semibold text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href="/dreams" className="hover:text-primary">Dream Numbers</Link>
                    <span>/</span>
                    <span className="text-gray-900 capitalize">{dream.dream}</span>
                </div>
            </Container>
        </div>

        {/* Hero Section */}
        <Section background="white" className="!py-16 md:!py-24 border-b border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <Container className="text-center max-w-4xl mx-auto">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-blue-50 border border-blue-100">
                Official Dream Target
              </span>
            </div>
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight capitalize">
              {dream.dream} <span className="text-primary block md:inline">Dream Number</span>
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-medium text-gray-500 leading-relaxed">
              Find the connection between dreaming of a <strong>{dream.dream}</strong> and the official Teer target numbers used in Shillong and Khanapara.
            </p>
            
            {/* The Huge Numbers Display */}
            <div className="bg-[#111827] rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-2xl mx-auto border border-gray-800">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-6">Target Numbers for {dream.dream}</span>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {dream.numbers.split(",").map((num: string) => (
                            <Link
                                key={num.trim()}
                                href={`/number/${num.trim().padStart(2, '0')}`}
                                className="inline-flex h-20 w-24 md:h-24 md:w-32 items-center justify-center rounded-2xl bg-primary text-4xl md:text-5xl font-black text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/10 hover:bg-blue-700 hover:scale-105 transition-all"
                                title={`View Number ${num.trim()} Analytics`}
                            >
                                {num.trim()}
                            </Link>
                        ))}
                    </div>
                    <p className="text-blue-300/60 text-xs mt-4 font-medium">Click any number to view its full history &amp; frequency</p>
                </div>
            </div>
          </Container>
        </Section>

        {/* Content Section for SEO Expert Text */}
        <Section background="gray" className="!py-16">
            <Container className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What does it mean?</h2>
                    <div 
                        className="prose prose-lg prose-blue max-w-none text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-900"
                        dangerouslySetInnerHTML={{ 
                            __html: (dream.bodyText || `If you dreamed about a **${dream.dream}**, the traditional Teer numbers associated with this dream are **${dream.numbers}**. Many players use these numbers for today&apos;s Shillong or Khanapara Teer target.`)
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                                        .replace(/\n/g, '<br/>')
                        }}
                    />
                </div>
            </Container>
        </Section>

        {/* Ad Slot */}
        <InlineAd />

        {/* Global CTA */}
        <Section background="white" className="!py-24 border-t border-gray-100">
          <Container className="text-center max-w-3xl mx-auto">
            <h2 className="mb-6 text-3xl font-black tracking-tight text-gray-900">
              Check if <span className="text-primary">{dream.numbers.split(",")[0]?.trim()}</span> won today!
            </h2>
            <p className="mb-10 text-gray-500 font-medium text-lg">
                We provide the fastest 100% verified live updates directly from the official archery counters.
            </p>
            <div className="flex justify-center gap-4">
              <Button href="/live" variant="primary" className="!px-10 !py-4 shadow-xl">
                Check Live Results
              </Button>
            </div>
          </Container>
        </Section>

        {/* Related Dreams Grid */}
        <Section className="!py-24 border-t border-gray-100" background="gray">
          <Container>
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Related <span className="text-primary">Dreams</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedDreams.map((item) => (
                <Link key={item.id} href={`/dreams/${item.slug}`} className="block">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-center group">
                        <h4 className="font-bold text-gray-900 capitalize mb-2 group-hover:text-primary">{item.dream}</h4>
                        <div className="flex gap-1 justify-center flex-wrap">
                            {item.numbers.split(",").map((n: string) => (
                                <span key={n.trim()} className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{n.trim()}</span>
                            ))}
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
