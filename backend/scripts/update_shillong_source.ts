import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.game.update({
        where: { name: 'Shillong' },
        data: {
            historySourceUrl: 'https://teerresults.net/shillong-teer-previous-result/',
            liveSourceUrl: 'https://teerresults.net/shillong-teer-result/'
        }
    });

    console.log('Shillong Game Config Updated:');
    console.log(JSON.stringify(result, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
