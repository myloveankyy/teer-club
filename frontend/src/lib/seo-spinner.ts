// Deterministic hash: same input always produces same output (prevents ISR content flicker)
function stableHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

export function generateSemanticIntro(market: string, type: 'results' | 'common-numbers' | 'match-proofs', date?: string): string {
    const marketCapitalized = market.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    // Entity variations
    const entities = {
        archery: ['archery lottery', 'traditional bow-and-arrow draw', 'daily target game', 'archery-based lotto'],
        region: ['Meghalaya state', 'Northeast India', 'local official counters', 'Shillong region'],
        prediction: ['algorithmic predictions', 'calculated hit numbers', 'expert common numbers', 'house and ending targets'],
        results: ['verified historical datasets', 'official recent outcomes', 'live feed records', 'archived winning numbers']
    };

    // Deterministic selection: same market+type always picks the same variant
    const seed = stableHash(market + type);
    const pick = (arr: string[]) => arr[seed % arr.length];
    const todayStr = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (type === 'results') {
        const templates = [
            `Welcome to the official dataset for <strong>${marketCapitalized}</strong>. Here you can analyze ${pick(entities.results)}, study long-term patterns, and access our optimized programmatic SEO hub. As a prominent ${pick(entities.archery)} in the ${pick(entities.region)}, verifying your numbers against our 100% accurate archive is crucial.`,
            `Explore the complete historical archive for the <strong>${marketCapitalized}</strong> ${pick(entities.archery)}. We provide ${pick(entities.results)} sourced directly from the ${pick(entities.region)}. Track performance patterns and verify your tickets with absolute confidence.`,
            `Get real-time updates and historical records for <strong>${marketCapitalized}</strong>. This ${pick(entities.archery)} is a daily phenomenon in the ${pick(entities.region)}. Our platform aggregates ${pick(entities.results)} to help you build reliable statistical models.`
        ];
        return templates[seed % templates.length];
    } else if (type === 'common-numbers') {
        const templates = [
            `Looking for the best <strong>${marketCapitalized} Common Numbers</strong> for ${todayStr}? Our system utilizes deep historical analysis to provide ${pick(entities.prediction)}. Maximize your chances in this ${pick(entities.region)} ${pick(entities.archery)} by using our 100% verified targets.`,
            `Access today's (${todayStr}) highly accurate <strong>${marketCapitalized}</strong> ${pick(entities.prediction)}. We mathematically analyze past ${pick(entities.archery)} outcomes from the ${pick(entities.region)} to bring you the most reliable hit numbers, house, and ending targets.`,
            `100% Verified <strong>${marketCapitalized} targets</strong> for ${todayStr}. Don't rely on guesswork for the ${pick(entities.archery)}. We provide data-backed ${pick(entities.prediction)} generated from verified ${pick(entities.region)} records.`
        ];
        return templates[seed % templates.length];
    } else if (type === 'match-proofs') {
        const templates = [
            `View the verified match proof for <strong>${marketCapitalized}</strong> on ${todayStr}. We believe in absolute transparency for the ${pick(entities.archery)}. Compare our predicted targets with the official ${pick(entities.region)} results.`,
            `Did our <strong>${marketCapitalized}</strong> common numbers hit on ${todayStr}? Check our live verification dashboard. We log all ${pick(entities.prediction)} and cross-reference them with ${pick(entities.results)} from Meghalaya.`,
            `Transparent verification of our daily <strong>${marketCapitalized}</strong> targets against official records for ${todayStr}. See our accuracy rate for direct hits, house, and ending numbers.`
        ];
        return templates[seed % templates.length];
    }
    return '';
}

export function generateFAQSchema(market: string, type: 'results' | 'common-numbers', date?: string) {
    const marketCapitalized = market.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const todayStr = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    let faqs = [];

    if (type === 'results') {
        faqs = [
            {
                question: `What time is the ${marketCapitalized} result announced?`,
                answer: `The ${marketCapitalized} results are typically announced in two rounds (F/R and S/R) in the afternoon. Please check our live results tracker for the exact real-time updates.`
            },
            {
                question: `How can I find previous records for ${marketCapitalized}?`,
                answer: `We maintain a comprehensive, 100% verified historical dataset of ${marketCapitalized} results on this page. You can use it to analyze past trends.`
            },
            {
                question: `Is the ${marketCapitalized} result official?`,
                answer: `Yes, we aggregate our data directly from the official counters in Meghalaya to provide the fastest and most accurate ${marketCapitalized} records.`
            }
        ];
    } else {
        faqs = [
            {
                question: `What are the common numbers for ${marketCapitalized} today (${todayStr})?`,
                answer: `Today's (${todayStr}) common numbers for ${marketCapitalized} include mathematically calculated direct hit numbers, along with house and ending predictions. View the full list on this page.`
            },
            {
                question: `How are the ${marketCapitalized} hit numbers calculated?`,
                answer: `Our ${marketCapitalized} predictions are generated using advanced algorithmic analysis of past results, historical patterns, and verified dream numbers.`
            },
            {
                question: `Are these ${marketCapitalized} targets guaranteed?`,
                answer: `While our ${marketCapitalized} common numbers are highly accurate and based on historical data, archery lotteries involve chance. Always play responsibly.`
            }
        ];
    }

    return {
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
}

export function generateDatasetSchema(market: string) {
    const marketCapitalized = market.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    return {
        "@context": "https://schema.org/",
        "@type": "Dataset",
        "name": `${marketCapitalized} Historical Results Dataset`,
        "description": `Comprehensive, officially verified daily records of First Round (FR) and Second Round (SR) archery outcomes for ${marketCapitalized}.`,
        "url": `https://teer.club/results/${market}`,
        "keywords": [
            `${marketCapitalized} records`,
            `${marketCapitalized} archive`,
            `Meghalaya archery lottery data`
        ],
        "creator": {
            "@type": "Organization",
            "name": "Teer Club"
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isAccessibleForFree": true
    };
}
