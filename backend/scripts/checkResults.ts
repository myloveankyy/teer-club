import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResults() {
  const dateStr = "2026-05-04"; // Today
  const dateObj = new Date(dateStr + "T00:00:00Z");
  
  const results = await prisma.result.findMany({
    where: { date: dateObj },
    include: { game: true },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`Found ${results.length} results for today (${dateStr}):`);
  for (const r of results) {
    console.log(`- ${r.game.name}: FR=${r.round1 || 'null'} | SR=${r.round2 || 'null'} | Created=${r.createdAt.toISOString()} | Updated=${r.updatedAt.toISOString()}`);
  }

  const logs = await prisma.cronLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\nLast 10 Cron Logs:`);
  for (const l of logs) {
      console.log(`- [${l.createdAt.toISOString()}] ${l.game}: ${l.status} | FR=${l.round1} SR=${l.round2}`);
  }
}

checkResults().catch(console.error).finally(() => prisma.$disconnect());
