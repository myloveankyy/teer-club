import { PrismaClient } from '@prisma/client';
import { fetchStatic, fetchDynamic } from '../src/scrapers/fetchService';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  console.log("Fetching Khanapara Game URL from Database...");
  const game = await prisma.game.findFirst({
    where: { name: { contains: 'khanapara', mode: 'insensitive' } }
  });

  if (!game || !game.liveSourceUrl) {
    console.error("No Khanapara game found with a liveSourceUrl!");
    process.exit(1);
  }

  console.log(`Target URL: ${game.liveSourceUrl}`);
  
  console.log("Fetching Static HTML...");
  let result = await fetchStatic(game.liveSourceUrl);
  let html = result.html;
  
  if (!html || html.length < 1000) {
      console.log("Static failed, attempting Dynamic Playwright fetch...");
      result = await fetchDynamic(game.liveSourceUrl);
      html = result.html;
  }

  if (!html) {
      console.error("Failed to fetch HTML.");
      process.exit(1);
  }

  const outPath = path.join(__dirname, 'khanapara_dump.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`\n✅ SUCCESS! HTML saved to: ${outPath}`);
  console.log(`Please tell the AI assistant to read this file: backend/scripts/khanapara_dump.html`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
