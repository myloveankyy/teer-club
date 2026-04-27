
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupBhutan() {
    const bhutan = await prisma.game.findFirst({ where: { name: 'bhutan-day' } });
    if (bhutan) {
        await prisma.source.upsert({
            where: { gameId_url: { gameId: bhutan.id, url: 'https://bhutandayteers.com/' } },
            update: {
                renderType: 'DYNAMIC',
                priority: 1,
                selectors: {
                    container: '.result-section', // Need to verify this
                    fr: '.fr-val',
                    sr: '.sr-val',
                    date: '.current-date'
                } as any
            },
            create: {
                gameId: bhutan.id,
                url: 'https://bhutandayteers.com/',
                renderType: 'DYNAMIC',
                priority: 1,
                selectors: {
                    container: '.result-section',
                    fr: '.fr-val',
                    sr: '.sr-val',
                    date: '.current-date'
                } as any
            }
        });
        console.log('✅ Updated Bhutan Day Teer source');
    }
}

setupBhutan().finally(() => prisma.$disconnect());
