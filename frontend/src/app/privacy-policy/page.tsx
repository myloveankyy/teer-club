import type { Metadata } from "next";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";

export const metadata: Metadata = {
    title: "Privacy Policy | Teer Club - Official Teer Results Platform",
    description:
        "Privacy policy for Teer Club. Learn how we collect, use, and protect your data when using our Teer results and common numbers platform.",
    alternates: {
        canonical: "/privacy-policy",
    },
    openGraph: {
        title: "Privacy Policy | Teer Club",
        description: "Privacy policy for the Teer Club platform.",
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
            name: "Privacy Policy",
            item: "https://teer.club/privacy-policy",
        },
    ],
};

export default function PrivacyPolicyPage() {
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
                                Privacy Policy
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
                                    Information We Collect
                                </h2>
                                <div className="text-body text-gray-600 leading-relaxed space-y-4">
                                    <p>
                                        Teer Club is committed to protecting your privacy. We
                                        collect minimal data necessary for the functional operation
                                        of our platform:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>
                                            <strong className="text-gray-900">
                                                Usage Data:
                                            </strong>{" "}
                                            Pages visited, time spent, browser type, and device
                                            information collected automatically through analytics.
                                        </li>
                                        <li>
                                            <strong className="text-gray-900">Cookies:</strong> We
                                            use essential cookies for site functionality and
                                            analytics cookies to understand how visitors interact
                                            with our platform.
                                        </li>
                                        <li>
                                            <strong className="text-gray-900">Log Data:</strong>{" "}
                                            Server logs including IP addresses, browser type, and
                                            referring pages for security and performance monitoring.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    How We Use Your Information
                                </h2>
                                <div className="text-body text-gray-600 leading-relaxed space-y-4">
                                    <p>We use the collected information to:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Provide and maintain our Teer results service</li>
                                        <li>Improve and optimize website performance</li>
                                        <li>Analyze usage patterns to enhance user experience</li>
                                        <li>
                                            Prevent abuse and maintain the security of our systems
                                        </li>
                                        <li>
                                            Display relevant advertisements through Google AdSense
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Google AdSense &amp; Third-Party Advertising
                                </h2>
                                <div className="text-body text-gray-600 leading-relaxed space-y-4">
                                    <p>
                                        We use Google AdSense to display advertisements on our
                                        platform. Google and its partners may use cookies and web
                                        beacons to serve ads based on your prior visits to this and
                                        other websites. You can opt out of personalized advertising
                                        by visiting{" "}
                                        <a
                                            href="https://www.google.com/settings/ads"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Google Ads Settings
                                        </a>
                                        .
                                    </p>
                                    <p>
                                        For more information about how Google uses data, visit{" "}
                                        <a
                                            href="https://policies.google.com/technologies/partner-sites"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Google&apos;s Privacy &amp; Terms
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Cookies
                                </h2>
                                <div className="text-body text-gray-600 leading-relaxed space-y-4">
                                    <p>
                                        We use cookies to enhance your experience. You can control
                                        cookie settings through your browser. Disabling cookies may
                                        affect certain features of the site.
                                    </p>
                                    <div className="grid gap-3 sm:grid-cols-2 mt-4">
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                                                Essential
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Required for site functionality
                                            </span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                                                Analytics
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Helps us understand usage patterns
                                            </span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                                                Advertising
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Used by Google AdSense for ads
                                            </span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                                                Performance
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Monitors site speed and reliability
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Data Security
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    We implement industry-standard security measures to protect
                                    the data processed through our platform. However, no method
                                    of electronic transmission or storage is 100% secure. While
                                    we strive to protect your data, we cannot guarantee its
                                    absolute security.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Your Rights
                                </h2>
                                <div className="text-body text-gray-600 leading-relaxed space-y-4">
                                    <p>Depending on your jurisdiction, you may have the right to:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Access the personal data we hold about you</li>
                                        <li>Request correction or deletion of your data</li>
                                        <li>Opt out of personalized advertising</li>
                                        <li>Withdraw consent for data collection</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Children&apos;s Privacy
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    Teer Club is not intended for children under the age of 18.
                                    We do not knowingly collect personal information from
                                    minors. If you believe a minor has provided us with personal
                                    data, please contact us so we can take appropriate action.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
                                <h2 className="text-h2 text-gray-900 mb-4">
                                    Changes to This Policy
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    We may update this privacy policy from time to time. Any
                                    changes will be posted on this page with an updated revision
                                    date. Your continued use of the platform after any
                                    modifications constitutes your acceptance of the revised
                                    policy.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-primary/5 border border-primary/10 p-8 md:p-10">
                                <h2 className="text-h3 text-gray-900 mb-3">
                                    Contact Us
                                </h2>
                                <p className="text-body text-gray-600 leading-relaxed">
                                    If you have any questions about this privacy policy or your
                                    data, please reach out to us through our{" "}
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
