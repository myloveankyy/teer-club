
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResults() {
    const khanaparaResults = await prisma.result.findMany({
        where: { gameId: 'khanapara' },
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log('Khanapara Results:');
    console.table(khanaparaResults.map(r => ({
        date: r.date.toISOString().split('T')[0],
        fr: r.round1,
        sr: r.round2,
        conf: r.confidence,
        ver: r.verified
    })));

    const jowaiResults = await prisma.result.findMany({
        where: { gameId: 'jowai' },
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log('\nJowai Results:');
    console.table(jowaiResults.map(r => ({
        date: r.date.toISOString().split('T')[0],
        fr: r.round1,
        sr: r.round2,
        conf: r.confidence,
        ver: r.verified
    })));
}

checkResults().finally(() => prisma.$disconnect());
