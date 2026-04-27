
import { PrismaClient } from '@prisma/client';
import { scrapeWithHybrid } from './src/scrapers/hybridEngine';
import { ScrapeConfig } from './src/types/scraper';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function debug() {
    console.log('--- Debugging Scraper ---');

    const sources = [
        {
            name: 'Khanapara Calculator',
            url: 'https://shillongteercalculator.in/khanapara-teer-result/',
            renderType: 'DYNAMIC',
            selectors: {
                container: '#teer-result-card',
                fr: '#khan-first',
                sr: '#khan-second',
                date: '.teer-title'
            }
        }
    ];

    for (const s of sources) {
        console.log(`\nTesting ${s.name}...`);
        const config: ScrapeConfig = {
            url: s.url,
            gameId: 'debug',
            selectors: s.selectors as any,
            renderType: s.renderType as any,
            detectApiEndpoints: false
        };

        try {
            const results = await scrapeWithHybrid(config);
            console.log(`Results for ${s.name}:`, JSON.stringify(results, null, 2));
        } catch (err: any) {
            console.error(`Error for ${s.name}:`, err.message);
        }
    }
}

debug().finally(() => prisma.$disconnect());
