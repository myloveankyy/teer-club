import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const game = await prisma.game.findFirst({
        where: { name: 'Shillong' }
    });
    console.log('Shillong Game Config:');
    console.log(JSON.stringify(game, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
