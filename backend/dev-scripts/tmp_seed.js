const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const game = await prisma.game.findFirst({ where: { name: 'shillong' } });
    if (!game) {
        console.error('Shillong game not found');
        return;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - i);

        await prisma.result.upsert({
            where: {
                gameId_date: {
                    gameId: game.id,
                    date: date
                }
            },
            update: {
                round1: (Math.floor(Math.random() * 90) + 10).toString(),
                round2: (Math.floor(Math.random() * 90) + 10).toString(),
                confidence: 'HIGH',
                verified: true
            },
            create: {
                gameId: game.id,
                date: date,
                round1: (Math.floor(Math.random() * 90) + 10).toString(),
                round2: (Math.floor(Math.random() * 90) + 10).toString(),
                confidence: 'HIGH',
                verified: true
            }
        });
    }
    console.log('Seeded 5 days of results for Shillong');
}

main().catch(console.error).finally(() => prisma.$disconnect());
