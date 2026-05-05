/*
 * This file has been removed.
 * Sitemap proxying is handled by the rewrites in next.config.ts.
 * Having both this route AND the rewrite caused duplicate sitemap path conflicts.
 *
 * See next.config.ts rewrites for the active sitemap proxy configuration.
 */

import { NextResponse } from 'next/server';

// Redirect to the canonical sitemap URL handled by next.config.ts rewrites
export async function GET() {
    return NextResponse.redirect(new URL('/sitemap.xml', 'https://teer.club'), 301);
}
