import prisma from "./prisma";

async function cleanup() {
    console.log("Starting DB cleanup for trailing spaces...");

    try {
        // 1. Fix Games with trailing spaces
        const games = await prisma.game.findMany();
        for (const g of games) {
            const trimmedName = g.name.trim();
            const trimmedId = g.id.trim();
            if (g.name !== trimmedName || g.id !== trimmedId) {
                console.log(`Fixing game: "${g.name}"`);
                
                // If ID also has space, we might need to recreate or update cascade if DB supports it.
                // Assuming we can just update name and displayName:
                await prisma.game.update({
                    where: { id: g.id },
                    data: { 
                        name: trimmedName,
                        displayName: g.displayName.trim()
                    }
                });
                
                // If ID is string and has space, Prisma might allow updating it:
                if (g.id !== trimmedId) {
                    try {
                        await prisma.$executeRaw`UPDATE "Game" SET "id" = ${trimmedId} WHERE "id" = ${g.id}`;
                        console.log(`Updated ID to ${trimmedId}`);
                    } catch (e) {
                        console.log("Could not update ID via raw query, it might be referenced.");
                    }
                }
            }
        }

        // 2. Delete broken Pages with '%20' or ' ' in URL
        const brokenPages = await prisma.page.findMany({
            where: {
                OR: [
                    { url: { contains: ' ' } },
                    { url: { contains: '%20' } }
                ]
            }
        });

        console.log(`Found ${brokenPages.length} broken pages with spaces in URL.`);
        for (const p of brokenPages) {
            await prisma.page.delete({ where: { id: p.id } });
            console.log(`Deleted broken page: ${p.url}`);
        }

        console.log("Cleanup complete!");
    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
