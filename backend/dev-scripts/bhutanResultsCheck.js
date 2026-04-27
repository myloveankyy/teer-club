const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const game = await prisma.game.findFirst({
        where: { name: { contains: 'bhutan', mode: 'insensitive' } }
    });
    console.log("GAME:", game);
    const results = await prisma.result.findMany({
        where: { gameId: game.id },
        orderBy: { date: 'desc' },
        take: 3
    });
    console.log("RESULTS:", results);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
