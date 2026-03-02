import HomeClient from './HomeClient';
import type { Metadata } from 'next';

const INTERNAL_API = process.env.INTERNAL_API_URL || "http://127.0.0.1:5000";

export const metadata: Metadata = {
  title: 'Shillong Teer Result Today - Live FR & SR Numbers',
  description: 'Get live Shillong Teer, Khanapara Teer, Juwai Teer results today. FR & SR numbers updated in real-time with AI common numbers, dream number predictions, and historical archives.',
};

async function getLatestResults() {
  try {
    const res = await fetch(`${INTERNAL_API}/api/results/latest`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Failed to fetch latest results SSR", e);
    return null;
  }
}

async function getCommonNumbers() {
  try {
    const res = await fetch(`${INTERNAL_API}/api/common-numbers/today`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    console.error("Failed to fetch common numbers SSR", e);
    return [];
  }
}

async function getDummyWinners() {
  try {
    const res = await fetch(`${INTERNAL_API}/api/marketing/frontend/dummy-winners`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch dummy winners SSR", e);
    return [];
  }
}

export default async function HomePage() {
  const [latestResults, commonNumbers, dummyWinners] = await Promise.all([
    getLatestResults(),
    getCommonNumbers(),
    getDummyWinners(),
  ]);

  return (
    <>
      {/* FAQ Structured Data for SEO Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Shillong Teer result today?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Shillong Teer results are declared in two rounds. Round 1 (FR) is usually out by 3:45 PM and Round 2 (SR) by 4:45 PM. You can find the latest verified numbers on Teer Club."
                }
              },
              {
                "@type": "Question",
                "name": "How to get Teer common numbers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Teer Club provides AI-generated common numbers for Shillong, Khanapara, and Juwai games based on historical data patterns and probability analysis."
                }
              },
              {
                "@type": "Question",
                "name": "Are Teer results updated in real-time?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Teer Club uses an automated live tracker to fetch and update Shillong, Khanapara, and Juwai results the moment they are declared."
                }
              }
            ]
          })
        }}
      />
      <HomeClient
        initialLatestResults={latestResults}
        initialCommonNumbers={commonNumbers}
        initialWinners={dummyWinners}
      />
    </>
  );
}
