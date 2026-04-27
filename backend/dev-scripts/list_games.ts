
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listGames() {
    const games = await prisma.game.findMany();
    console.log(JSON.stringify(games.map(g => ({ id: g.id, name: g.name, display: g.displayName })), null, 2));
}

listGames().finally(() => prisma.$disconnect());
