
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showAll() {
    const resultCount = await prisma.result.count();
    console.log('Total Results:', resultCount);

    if (resultCount > 0) {
        const samples = await prisma.result.findMany({ take: 5 });
        console.log('Sample Results:');
        console.log(samples);
    }

    const gameCount = await prisma.game.count();
    console.log('Total Games:', gameCount);

    if (gameCount > 0) {
        const games = await prisma.game.findMany({ take: 5 });
        console.log('Sample Games:');
        console.log(games);
    }
}

showAll().finally(() => prisma.$disconnect());
