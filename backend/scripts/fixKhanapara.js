const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    const game = await prisma.game.findFirst({ where: { name: 'Khanapara' } });
    if (!game) throw new Error('Khanapara not found');

    const corrections = [
        { date: '2026-04-25', r1: '43', r2: '40', r3: null },
        { date: '2026-04-24', r1: '58', r2: '43', r3: null },
        { date: '2026-04-23', r1: '15', r2: '08', r3: null },
    ];

    for (const c of corrections) {
        const d = new Date(c.date + 'T00:00:00Z');
        console.log(`Fixing ${c.date}...`);
        await prisma.result.upsert({
            where: {
                gameId_date: { gameId: game.id, date: d }
            },
            update: {
                round1: c.r1,
                round2: c.r2,
                round3: c.r3
            },
            create: {
                gameId: game.id,
                date: d,
                round1: c.r1,
                round2: c.r2,
                round3: c.r3
            }
        });
    }
    console.log('Correction complete.');
    await prisma.$disconnect();
}

fix().catch(console.error);
