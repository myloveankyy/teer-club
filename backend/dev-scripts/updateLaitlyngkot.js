const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const games = await prisma.game.findMany();
    let updated = false;

    for (const g of games) {
        if (g.name.toLowerCase().includes('laitlyngkot') || g.displayName.toLowerCase().includes('laitlyngkot')) {
            await prisma.game.update({
                where: { id: g.id },
                data: { hasRound3: true }
            });
            console.log(`✅ Successfully updated ${g.name} (${g.displayName}) to hasRound3 = true`);
            updated = true;
        }
    }

    if (!updated) {
        console.log('❌ Could not find any game with "laitlyngkot"');
        console.log('Available games:', games.map(g => g.name).join(', '));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
