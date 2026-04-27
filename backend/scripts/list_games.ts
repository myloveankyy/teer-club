import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const games = await prisma.game.findMany();
    console.log('Available games:');
    games.forEach(g => {
        console.log(`- ID: ${g.id}, Name: ${g.name}, Display: ${g.displayName}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
