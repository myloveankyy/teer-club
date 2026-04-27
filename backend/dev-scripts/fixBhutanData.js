const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const game = await prisma.game.findFirst({
        where: { name: { contains: 'bhutan', mode: 'insensitive' } }
    });

    if (!game) {
        console.log("Bhutan game not found");
        return;
    }

    const results = await prisma.result.findMany({
        where: { gameId: game.id }
    });

    let updatedCount = 0;
    for (const r of results) {
        // Find rows affected by the merge anomaly: round1 === round2, AND round3 is populated exactly as the true SR.
        if (r.round1 === r.round2 && r.round3) {
            await prisma.result.update({
                where: { id: r.id },
                data: {
                    round1: r.round1, // FR is correct
                    round2: r.round3, // Shift SR back to round2
                    round3: null      // TR shouldn't exist
                }
            });
            updatedCount++;
        }
    }

    console.log(`✅ Fixed ${updatedCount} corrupted rows for ${game.displayName}!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
