export function generateSemanticIntro(market: string, type: 'results' | 'common-numbers' | 'match-proofs', date?: string): string {
    const marketCapitalized = market.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    // Entity variations
    const entities = {
        archery: ['archery lottery', 'traditional bow-and-arrow draw', 'daily target game', 'archery-based lotto'],
        region: ['Meghalaya state', 'Northeast India', 'local official counters', 'Shillong region'],
        prediction: ['algorithmic predictions', 'calculated hit numbers', 'expert common numbers', 'house and ending targets'],
        results: ['verified historical datasets', 'official recent outcomes', 'live feed records', 'archived winning numbers']
    };

    const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const todayStr = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (type === 'results') {
        const templates = [
            `Welcome to the official dataset for <strong>${marketCapitalized}</strong>. Here you can analyze ${random(entities.results)}, study long-term patterns, and access our optimized programmatic SEO hub. As a prominent ${random(entities.archery)} in the ${random(entities.region)}, verifying your numbers against our 100% accurate archive is crucial.`,
            `Explore the complete historical archive for the <strong>${marketCapitalized}</strong> ${random(entities.archery)}. We provide ${random(entities.results)} sourced directly from the ${random(entities.region)}. Track performance patterns and verify your tickets with absolute confidence.`,
            `Get real-time updates and historical records for <strong>${marketCapitalized}</strong>. This ${random(entities.archery)} is a daily phenomenon in the ${random(entities.region)}. Our platform aggregates ${random(entities.results)} to help you build reliable statistical models.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    } else if (type === 'common-numbers') {
        const templates = [
            `Looking for the best <strong>${marketCapitalized} Common Numbers</strong> for ${todayStr}? Our system utilizes deep historical analysis to provide ${random(entities.prediction)}. Maximize your chances in this ${random(entities.region)} ${random(entities.archery)} by using our 100% verified targets.`,
            `Access today's (${todayStr}) highly accurate <strong>${marketCapitalized}</strong> ${random(entities.prediction)}. We mathematically analyze past ${random(entities.archery)} outcomes from the ${random(entities.region)} to bring you the most reliable hit numbers, house, and ending targets.`,
            `100% Verified <strong>${marketCapitalized} targets</strong> for ${todayStr}. Don't rely on guesswork for the ${random(entities.archery)}. We provide data-backed ${random(entities.prediction)} generated from verified ${random(entities.region)} records.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    } else if (type === 'match-proofs') {
        const templates = [
            `View the verified match proof for <strong>${marketCapitalized}</strong> on ${todayStr}. We believe in absolute transparency for the ${random(entities.archery)}. Compare our predicted targets with the official ${random(entities.region)} results.`,
            `Did our <strong>${marketCapitalized}</strong> common numbers hit on ${todayStr}? Check our live verification dashboard. We log all ${random(entities.prediction)} and cross-reference them with ${random(entities.results)} from Meghalaya.`,
            `Transparent verification of our daily <strong>${marketCapitalized}</strong> targets against official records for ${todayStr}. See our accuracy rate for direct hits, house, and ending numbers.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
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
