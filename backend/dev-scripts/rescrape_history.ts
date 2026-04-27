
import { PrismaClient } from '@prisma/client';
import { scrapeWithHybrid } from './src/scrapers/hybridEngine';
import { ScrapeConfig } from './src/types/scraper';

const prisma = new PrismaClient();

async function reScrapeHistorical() {
    const games = ['khanapara', 'juwai'];

    for (const gameName of games) {
        const game = await prisma.game.findUnique({
            where: { name: gameName },
            include: { sources: { where: { isActive: true }, orderBy: { priority: 'asc' } } }
        });

        if (!game) continue;
        console.log(`\n--- Re-Scraping ${game.displayName} ---`);

        for (const source of game.sources) {
            console.log(`Using source: ${source.url}`);
            const config: ScrapeConfig = {
                url: source.url,
                gameId: game.id,
                gameName: game.name,
                renderType: source.renderType as any,
                selectors: source.selectors as any,
                maxPagesLimit: 20, // Audit last 20 pages/history
                detectApiEndpoints: false
            };

            try {
                const result = await scrapeWithHybrid(config);
                console.log(`Found ${result.results.length} results.`);

                for (const res of result.results) {
                    if (res.date && res.round1 && res.round1 !== 'XX') {
                        await prisma.result.upsert({
                            where: { gameId_date: { gameId: game.id, date: new Date(res.date + 'T00:00:00Z') } },
                            update: {
                                round1: res.round1,
                                round2: res.round2,
                                round3: res.round3,
                                confidence: 'CONFIRMED',
                                sourceCount: { increment: 1 }
                            },
                            create: {
                                gameId: game.id,
                                date: new Date(res.date + 'T00:00:00Z'),
                                round1: res.round1,
                                round2: res.round2,
                                round3: res.round3,
                                confidence: 'MEDIUM',
                                sourceCount: 1
                            }
                        });
                    }
                }
            } catch (err: any) {
                console.error(`Source failed: ${source.url}`, err.message);
            }
        }
    }
}

reScrapeHistorical().finally(() => prisma.$disconnect());
