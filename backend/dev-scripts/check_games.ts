
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGames() {
    const games = await prisma.game.findMany();
    console.log('Games:');
    console.table(games.map(g => ({ id: g.id, name: g.name, slug: g.slug })));
}

checkGames().finally(() => prisma.$disconnect());
