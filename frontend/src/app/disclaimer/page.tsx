import type { Metadata } from "next";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";

export const metadata: Metadata = {
    title: "Disclaimer | Teer Club - Official Teer Results Platform",
    description:
        "Important disclaimer for Teer Club users. All Teer results, common numbers, and predictions are for informational and educational purposes only.",
    alternates: {
        canonical: "https://teer.club/disclaimer",
    },
    openGraph: {
        title: "Disclaimer | Teer Club",
        description: "Official disclaimer for the Teer Club platform.",
        type: "website",
        locale: "en_US",
        siteName: "Teer Club",
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://teer.club",
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "Disclaimer",
            item: "https://teer.club/disclaimer",
        },
    ],
};

export default function DisclaimerPage() {
    return (
        <PageLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <main className="flex-1">
                <Section
                    background="white"
                    className="!py-16 md:!py-24 border-b border-gray-100 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:24px_24px]"
                >
                    <Container>
                        <div className="mx-auto max-w-3xl">
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 shadow-sm">
                                Legal
                            </div>
                            <h1 className="mb-6 text-h1 text-gray-900 leading-tight">
                                Disclaimer
                            </h1>
                            <p className="text-body text-gray-500 leading-relaxed">
                                Last updated: April 2025
                            </p>
                        </div>
                    </Container>
                </Section>

                <Section background="gray" className="!py-16 md:!py-24">
                    <Container>
                        <div className="mx-auto max-w-3xl space-y-10">
                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    General Information
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    The information provided on Teer Club (teer.club) is for
                                    general informational and educational purposes only. All Teer
                                    results displayed on this platform are sourced from
                                    publicly available information and official Teer association
                                    counters. We strive for accuracy, but we make no warranties
                                    or representations of any kind regarding the completeness,
                                    accuracy, reliability, or availability of any information on
                                    this website.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Common Numbers &amp; Predictions
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    The &ldquo;Common Numbers&rdquo; and prediction data provided
                                    on this platform are generated using statistical analysis of
                                    historical data patterns. These numbers are purely
                                    analytical in nature and are{" "}
                                    <strong className="text-gray-900">
                                        not guaranteed to be accurate or result in any winning
                                        outcome
                                    </strong>
                                    . They should not be treated as financial advice or a
                                    guarantee of future results.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    No Financial Advice
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    Teer Club does not provide financial, legal, or gambling
                                    advice. Any reliance you place on the information available on
                                    this website is strictly at your own risk. We shall not be
                                    held liable for any loss or damage arising from the use of
                                    any information published on this site.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Third-Party Links
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    This website may contain links to third-party websites. These
                                    links are provided solely for convenience and informational
                                    purposes. Teer Club does not endorse the content on any
                                    third-party website and is not responsible for the content,
                                    accuracy, or practices of such sites.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Accuracy of Results
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    While we make every effort to ensure the results displayed on
                                    Teer Club are accurate and up-to-date, there may be occasional
                                    delays or discrepancies. For official confirmation of any
                                    result, please consult the relevant official Teer counter
                                    or association directly.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Changes to This Disclaimer
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    We reserve the right to update or modify this disclaimer at
                                    any time without prior notice. Any changes will be reflected
                                    on this page with an updated revision date. Your continued use
                                    of the website after any modifications constitutes
                                    your acceptance of the revised disclaimer.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-primary/5 border border-primary/10 p-8 md:p-10">
                                <h2 className="text-h3 text-gray-900 mb-3">
                                    Contact Us
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    If you have any questions about this disclaimer or the
                                    information presented on our platform, please reach out to us
                                    through our{" "}
                                    <a
                                        href="/about"
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        About
                                    </a>{" "}
                                    page.
                                </p>
                            </div>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
