const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- DATABASE AUDIT (2026-04-25) ---');
    const today = new Date('2026-04-25T00:00:00Z');

    const results = await prisma.result.findMany({
        where: { date: today },
        include: { game: true }
    });

    console.log('Today Results found:', results.length);
    results.forEach(r => {
        console.log(` - [${r.game.name}] ${r.game.displayName}: FR=${r.round1}, SR=${r.round2}`);
    });

    const allGames = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });
    console.log('\n--- GAMES EXPECTING DATA ---');
    allGames.forEach(g => {
        const hasToday = results.some(r => r.gameId === g.id);
        if (!hasToday) {
            console.log(`MISSING: ${g.displayName} (Last Status: ${g.lastLiveScrapeStatus || 'IDLE'})`);
        }
    });

    await prisma.$disconnect();
}

check().catch(console.error);
