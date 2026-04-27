import React from "react";
import { Section, Container } from "./ui/Grid";
import { SectionHeader } from "./ui/SectionHeader";
import { Card } from "./ui/Card";

const faqs = [
    {
        question: "How can I check Teer Result Today fastest?",
        answer: "The fastest way to check Teer Result Today for Shillong, Khanapara, and Juwai is through our live feed on Teer.club. We update results every 10 seconds directly from official archery counters."
    },
    {
        question: "How are Teer common numbers calculated?",
        answer: "Our Teer common numbers are calculated using a statistical engine that analyzes the last 30 days of historical results. We look for 'house' and 'ending' logic patterns to provide daily target numbers."
    },
    {
        question: "Are Khanapara and Juwai Teer results available here?",
        answer: "Yes, we provide live updates and archives for Shillong, Khanapara, Juwai, Laitlyngkot, and multiple other regional Teer games across the North-East."
    },
    {
        question: "When are the Teer results usually announced?",
        answer: "Teer results are typically announced in two standard pulses. Pulse One usually occurs between 3:45 PM and 4:30 PM, while Pulse Two follows between 4:45 PM and 5:30 PM IST."
    }
];

export function FAQ() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <Section background="gray" className="border-t border-gray-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Container>
                <SectionHeader
                    title="Frequently Asked Questions"
                    subtitle="Common queries about Teer results, common numbers, and how our prediction engine works."
                    centered={true}
                />
                <div className="mx-auto max-w-3xl space-y-4">
                    {faqs.map((faq, idx) => (
                        <Card key={idx} className="!rounded-theme p-6 transition-all hover:border-primary/30 bg-surface">
                            <h3 className="text-lg font-bold text-foreground mb-3 flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">Q</span>
                                {faq.question}
                            </h3>
                            <p className="text-sm md:text-base text-foreground/70 font-medium leading-relaxed pl-9">
                                {faq.answer}
                            </p>
                        </Card>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
