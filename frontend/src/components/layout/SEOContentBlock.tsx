import Link from "next/link";

interface SEOLink {
    text: string;
    href: string;
}

interface SEOContentBlockProps {
    title: string;
    paragraphs: (string | React.ReactNode)[];
    links?: SEOLink[];
    className?: string;
}

/**
 * Standard SEO content block — 2-column prose layout with keyword-rich text
 * and internal links. Placed at the bottom of data pages.
 *
 * Usage:
 * ```tsx
 * <SEOContentBlock
 *   title="About Juwai Teer Previous Results"
 *   paragraphs={[
 *     <>The <strong className="text-gray-900">Juwai Teer Previous Result</strong> archive provides...</>,
 *     <>Whether you are analyzing patterns...</>,
 *     <>Each <strong className="text-gray-900">Teer Counter Result</strong>...</>,
 *     <>For today&apos;s live numbers, visit the <Link>...</Link></>,
 *   ]}
 * />
 * ```
 */
export function SEOContentBlock({ title, paragraphs, className = "" }: SEOContentBlockProps) {
    // Split paragraphs into two columns
    const midpoint = Math.ceil(paragraphs.length / 2);
    const col1 = paragraphs.slice(0, midpoint);
    const col2 = paragraphs.slice(midpoint);

    return (
        <section className={`bg-white py-16 md:py-20 border-t border-gray-100 ${className}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
                    {title}
                </h2>
                <div className="grid gap-8 md:grid-cols-2 text-sm text-gray-500 leading-relaxed">
                    <div className="space-y-4">
                        {col1.map((p, idx) => (
                            <p key={idx}>{p}</p>
                        ))}
                    </div>
                    {col2.length > 0 && (
                        <div className="space-y-4">
                            {col2.map((p, idx) => (
                                <p key={idx}>{p}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/**
 * Helper component for SEO keyword links used inside content blocks
 */
export function SEOLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-indigo-600 font-bold hover:underline">
            {children}
        </Link>
    );
}

/**
 * Helper for bold keywords in SEO content
 */
export function Keyword({ children }: { children: React.ReactNode }) {
    return <strong className="text-gray-900">{children}</strong>;
}
