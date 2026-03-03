// lib/seo/parasite.ts

/**
 * Grey Hat SEO: "Click-Bait" Title Tag Rotator
 * Dynamically changes the SEO Title based on the time of day to maximize CTR.
 * 
 * Schedule (IST +5:30):
 * - Morning (12:00 AM - 3:00 PM): "🔴 Shillong Teer Result Today [Date] - Live Updates Soon"
 * - Pre-Result (3:00 PM - 4:00 PM): "⚠️ Shillong Teer Result LIVE [Date] - FR Coming in X Mins!"
 * - Post-Result (4:00 PM onwards): "✅ Shillong Teer Result [Date] - FR is [Actual Number]!"
 */
export function getDynamicTitle(region: string, date: string, frNumber?: string, srNumber?: string): string {
    const now = new Date();
    // Convert current time to IST
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istTime = new Date(utcTime + istOffset);

    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);

    // If we already have numbers, use the aggressive post-result title
    if (frNumber && frNumber !== '--') {
        let title = `✅ ${formattedRegion} Teer Result ${date} - FR is ${frNumber}!`;
        if (srNumber && srNumber !== '--') {
            title += ` SR is ${srNumber}!`;
        }
        return title;
    }

    // Pre-Result Hype Phase (3:00 PM - 4:30 PM for Shillong)
    if (region.toLowerCase() === 'shillong' && hours === 15) {
        let minsLeft = 60 - minutes;
        if (minsLeft <= 0) minsLeft = 1; // Safeguard
        return `⚠️ ${formattedRegion} Teer Result LIVE ${date} - FR in ${minsLeft} Mins!`;
    }

    // Default / Morning Phase
    return `🔴 ${formattedRegion} Teer Result Today ${date} - Live Updates Soon`;
}

/**
 * Grey Hat SEO: The "Parasite Schema" Injection
 * Generates an AggregateRating JSON-LD object with mathematically consistent, 
 * high-volume fake reviews (e.g., 4.9 stars, 14,000+ votes) to display "Gold Stars" on Google.
 */
export function generateParasiteReviewSchema(url: string, baseName: string) {
    // Generate a deterministic but seemingly random high number based on the URL string
    // This ensures that the same page always gives the same 'random' number of votes
    // so Google doesn't see fluctuating reviews every crawl.
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        hash = ((hash << 5) - hash) + url.charCodeAt(i);
        hash |= 0;
    }

    // Convert to positive integer between 8,000 and 25,000
    const voteCount = Math.abs(hash) % 17000 + 8000;

    // Generate a rating between 4.7 and 4.9
    const ratingValue = (4.7 + (Math.abs(hash) % 3) * 0.1).toFixed(1);

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": baseName,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingValue.toString(),
            "ratingCount": voteCount.toString(),
            "bestRating": "5",
            "worstRating": "1"
        }
    };
}
