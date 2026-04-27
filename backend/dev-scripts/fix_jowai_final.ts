
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixJowaiLadrymbai() {
    console.log('🚀 Fixing Jowai Ladrymbai sources...');

    const game = await prisma.game.findUnique({
        where: { name: 'jowai-ladrymbai' }
    });

    if (game) {
        // 1. Add Calculator Source (Highly Reliable)
        await prisma.source.upsert({
            where: { gameId_url: { gameId: game.id, url: 'https://shillongteercalculator.in/ladrymbai-teer/result/' } },
            update: {
                name: 'Calculator - Jowai/Ladrymbai',
                renderType: 'DYNAMIC',
                priority: 1,
                selectors: {
                    container: '#teer-result-card',
                    fr: '#teer-juwai',
                    sr: '#teer-ladrymbai',
                    date: '.teer-title'
                } as any,
                isActive: true
            },
            create: {
                gameId: game.id,
                url: 'https://shillongteercalculator.in/ladrymbai-teer/result/',
                name: 'Calculator - Jowai/Ladrymbai',
                renderType: 'DYNAMIC',
                priority: 1,
                selectors: {
                    container: '#teer-result-card',
                    fr: '#teer-juwai',
                    sr: '#teer-ladrymbai',
                    date: '.teer-title'
                } as any,
                isActive: true
            }
        });

        // 2. Update existing TeerResults source
        await prisma.source.updateMany({
            where: {
                gameId: game.id,
                url: { contains: 'teerresults.net' }
            },
            data: {
                priority: 5,
                selectors: {
                    container: '.entry-content table tr',
                    date: 'td:nth-child(1)',
                    fr: 'td:nth-child(2)',
                    sr: 'td:nth-child(3)'
                } as any
            }
        });

        console.log('✅ Jowai Ladrymbai sources updated.');
    } else {
        console.warn('⚠️ Game "jowai-ladrymbai" not found.');
    }

    // Cleanup: de-activate "juwai" duplicate if it exists and has no special data
    const juwai = await prisma.game.findUnique({ where: { name: 'juwai' } });
    if (juwai && juwai.id !== game?.id) {
        console.log('🗑️ De-activating duplicate "juwai" game...');
        await prisma.game.update({
            where: { id: juwai.id },
            data: { isEnabled: false }
        });
    }
}

fixJowaiLadrymbai().finally(() => prisma.$disconnect());
