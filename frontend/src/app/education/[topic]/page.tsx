import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-static';

const articles: Record<string, { title: string; content: string }> = {
    'what-is-teer': {
        title: 'What is Teer? Exploring Meghalaya\'s Traditional Archery Lottery',
        content: `
            <h2>The Origins of Teer</h2>
            <p>Teer is a unique, legal lottery game played primarily in Meghalaya, India. Unlike typical randomized lotteries, Teer relies heavily on traditional archery. Local archery clubs organize the event, drawing hundreds of archers every day to a designated field.</p>
            <p>During the event, archers shoot thousands of arrows at a cylindrical target made of cane. The final winning number is strictly derived from the total aggregate of arrows that successfully hit the target. This blend of cultural sport and sheer chance has made Teer a daily phenomenon across Northeast India.</p>
            <h2>How the Game Unfolds</h2>
            <p>The game is split into two daily rounds: the First Round (FR) typically played at 4:00 PM, and the Second Round (SR) at 4:50 PM. Spectators and participants place bets ranging from single digits to complex predictive "House" (first digit) and "Ending" (second digit) structures.</p>
            <p>Bookies scattered across the state take bets almost right up until the arrows fly. Because the ultimate outcome depends on the physical skill of the archers and the chaotic spread of thousands of arrows, mathematics and predictive trend analysis have become wildly popular methods for estimating the outcome.</p>
        `
    },
    'teer-rules': {
        title: 'Official Teer Rules & How to Place Bets',
        content: `
            <h2>Understanding the Rules</h2>
            <p>There are strict protocols governing the Khasi Hills Archery Sports Association. To qualify as a valid round, there must be a minimum of 50 archers shooting simultaneously. For the First Round (FR), exactly 30 archers shoot 30 arrows each, and 20 archers shoot 20 arrows each. A massive 1,300 to 1,500 arrows must be released.</p>
            <h2>Betting Mechanics</h2>
            <p>You can place several types of bets:</p>
            <ul>
                <li><strong>Direct Hit:</strong> You guess the exact 2-digit number (e.g., 45).</li>
                <li><strong>House:</strong> You guess the first digit (e.g., 4 in the number 45).</li>
                <li><strong>Ending:</strong> You guess the second digit (e.g., 5 in the number 45).</li>
            </ul>
            <p>Payouts are generally standardized across verified counters, though minor fluctuations occur.</p>
        `
    },
    'how-calculation-works': {
        title: 'How is the Winning Teer Number Calculated?',
        content: `
            <h2>The Mathematics of the Target</h2>
            <p>Once the designated time elapses (usually a few frantic minutes of rapid arrow release), officials carefully extract and count only the arrows that penetrated the target. Arrows that missed or glanced off the edges do not count.</p>
            <h2>Extracting the 2-Digit Output</h2>
            <p>Suppose the officials count exactly 874 arrows sticking into the target. To determine the winning logical number for that round, they take the last two digits of the total sum. In this scenario, the winning number is <strong>74</strong>.</p>
            <p>If the total arrow count was 902, the winning number would be <strong>02</strong>.</p>
            <p>This transparent, tactile method of number generation is why the game is so deeply trusted. It removes digital randomness and replaces it with physical, verifiable outcomes.</p>
        `
    }
};

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
    const { topic } = await params;
    const article = articles[topic];
    if (!article) return { title: 'Not Found' };

    return {
        title: `${article.title} - Teer Education`,
        description: `Read our comprehensive guide: ${article.title}. Learn everything about Teer history, rules, and calculations.`,
        openGraph: {
            title: article.title,
            type: 'article',
        }
    };
}

export async function generateStaticParams() {
    return Object.keys(articles).map(topic => ({ topic }));
}

export default async function EducationalArticle({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const article = articles[topic];

    if (!article) {
        notFound();
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Article Schema for Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": article.title,
                        "author": {
                            "@type": "Organization",
                            "name": "Teer Club"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Teer Club",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://teer.club/logo.png"
                            }
                        }
                    })
                }}
            />

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                {article.title}
            </h1>

            <div
                className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-img:rounded-3xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
        </div>
    );
}
