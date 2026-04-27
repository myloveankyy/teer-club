import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const game = await prisma.game.findFirst({
        where: {
            OR: [
                { name: { equals: 'Shillong', mode: 'insensitive' } },
                { displayName: { contains: 'Shillong', mode: 'insensitive' } }
            ]
        }
    });

    if (!game) {
        console.log('Game not found');
        return;
    }

    console.log(`Found game: ${game.displayName} (ID: ${game.id})`);

    const results = await prisma.result.findMany({
        where: { gameId: game.id },
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log('Latest 10 results in DB:');
    results.forEach(r => {
        console.log(`${r.date.toISOString().split('T')[0]}: Round1: ${r.round1}, Round2: ${r.round2}`);
    });

    const total = await prisma.result.count({ where: { gameId: game.id } });
    console.log('Total results in DB:', total);

    const oldest = await prisma.result.findMany({
        where: { gameId: game.id },
        orderBy: { date: 'asc' },
        take: 1
    });
    if (oldest[0]) {
        console.log('Oldest result date:', oldest[0].date.toISOString().split('T')[0]);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
