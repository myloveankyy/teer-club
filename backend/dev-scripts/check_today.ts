
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkToday() {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const today = new Date(Date.now() + istOffset).toISOString().split('T')[0];

    const results = await prisma.result.findMany({
        where: { date: new Date(today + 'T00:00:00Z') },
        include: { game: true }
    });

    console.log(`Results for ${today}:`);
    console.table(results.map(r => ({
        game: r.game.name,
        fr: r.round1,
        sr: r.round2,
        conf: r.confidence
    })));
}

checkToday().finally(() => prisma.$disconnect());
