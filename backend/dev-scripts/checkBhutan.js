const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const game = await prisma.game.findFirst({
        where: { name: { contains: 'bhutan', mode: 'insensitive' } }
    });
    console.log(JSON.stringify(game, null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
