const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { triggerGoogleIndex } = require('./seoIndexer');
const { generateStaticSitemap } = require('./sitemapGenerator');

// Keys — same pattern used across the codebase
const GEMINI_TEXT_KEY = 'AIzaSyAImJt5aYwK0lgqtANjOwXQRbM1sDai7Sw';
const GEMINI_IMAGE_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCl253SC0rBsg_-1J7m0Rdni7mVNJgq8_0';
const genAI = new GoogleGenerativeAI(GEMINI_TEXT_KEY);

const BLOG_IMAGES_DIR = path.join(__dirname, '../public/blog-images');
if (!fs.existsSync(BLOG_IMAGES_DIR)) {
    fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
}

const SITE_URL = 'https://teer.club';

// Niche keyword themes for high-ranking teer content
const KEYWORD_THEMES = [
    { theme: "Shillong Teer Common Number Today", category: "Strategies" },
    { theme: "Khanapara Teer Target Number Formula", category: "Strategies" },
    { theme: "Teer Dream Number Interpretation Guide", category: "Guides" },
    { theme: "How to Calculate Teer House Ending Number", category: "Guides" },
    { theme: "Shillong Teer Previous Result Analysis", category: "Tips & Tricks" },
    { theme: "Secret Teer Winning Formula Exposed", category: "Strategies" },
    { theme: "Juwai Teer Hit Number Tips Today", category: "Tips & Tricks" },
    { theme: "Best Teer Counter Apps and Websites 2025", category: "Guides" },
    { theme: "Teer Night Result Prediction Methods", category: "Strategies" },
    { theme: "Meghalaya Archery Teer History and Culture", category: "Announcements" },
    { theme: "Teer Result Pattern Analysis Weekly", category: "Tips & Tricks" },
    { theme: "Khanapara Teer Dream Number List", category: "Guides" },
    { theme: "How Teer Lottery Actually Works in Northeast India", category: "Announcements" },
    { theme: "Top 10 Lucky Numbers for Teer This Week", category: "Strategies" },
    { theme: "Teer Common Number Calculation Methods", category: "Guides" },
    { theme: "Shillong Teer Round 1 Round 2 Analysis", category: "Tips & Tricks" },
    { theme: "Teer Club Features and How to Use Them", category: "Announcements" },
    { theme: "Mathematical Approach to Teer Prediction", category: "Strategies" },
    { theme: "Understanding Teer House and Ending Numbers", category: "Guides" },
    { theme: "Teer Result Trends and Frequency Charts", category: "Tips & Tricks" },
];

/**
 * Helper to create URL-safe slugs
 */
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80)
        + '-' + Date.now().toString(36);
}

/**
 * Fetches existing posts for internal linking context
 */
async function getExistingContent() {
    try {
        const postsRes = await db.query(`
            SELECT title, slug, category FROM posts 
            WHERE is_published = true 
            ORDER BY created_at DESC 
            LIMIT 15
        `);

        // Also list static pages for internal linking
        const staticPages = [
            { title: "Shillong Teer Results", url: "/", description: "Live teer results" },
            { title: "Teer Result History", url: "/history", description: "Past results archive" },
            { title: "Teer Predictions", url: "/predictions", description: "AI-powered predictions" },
            { title: "Dream Number Lookup", url: "/dreams", description: "Dream interpretation for teer" },
            { title: "Teer Tools & Calculator", url: "/tools", description: "Probability calculator" },
            { title: "Teer Blog", url: "/blog", description: "Insights and guides" },
        ];

        return {
            existingPosts: postsRes.rows.map(p => ({
                title: p.title,
                url: `/blog/${p.slug}`,
            })),
            staticPages,
        };
    } catch (err) {
        console.error('[Auto-Blog] Failed to fetch existing content:', err.message);
        return { existingPosts: [], staticPages: [] };
    }
}

/**
 * Pick a topic that hasn't been used recently
 */
async function pickSmartTopic() {
    try {
        const recentRes = await db.query(`
            SELECT generation_theme FROM posts 
            WHERE is_ai_generated = true 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        const recentThemes = recentRes.rows.map(r => r.generation_theme).filter(Boolean);

        // Filter out recently used themes
        const available = KEYWORD_THEMES.filter(k => !recentThemes.includes(k.theme));

        if (available.length === 0) {
            // All used recently, just pick random
            return KEYWORD_THEMES[Math.floor(Math.random() * KEYWORD_THEMES.length)];
        }

        return available[Math.floor(Math.random() * available.length)];
    } catch (err) {
        // If the column doesn't exist yet, just pick random
        return KEYWORD_THEMES[Math.floor(Math.random() * KEYWORD_THEMES.length)];
    }
}

/**
 * Generate featured image using Gemini Imagen 3
 */
async function generateFeaturedImage(title, theme) {
    try {
        const prompt = `A vibrant, eye-catching blog featured image for Indian audience about "${theme}". 
        The image should have:
        - Rich, warm Indian colors (saffron, deep red, royal blue, gold)
        - Traditional Meghalaya archery (Teer) elements - bamboo arrows, wooden bows, archery targets
        - Misty green hills of Northeast India in the background
        - A mystical, fortune-telling atmosphere with subtle number symbols
        - Modern graphic design overlay with bold typography area
        - "TEER.CLUB" text subtly integrated
        - Cinematic quality, 4K resolution, hyper-realistic digital art
        - Landscape orientation suitable for blog featured image
        - NO text in Devanagari or other scripts, English only`;

        console.log('[Auto-Blog] Generating featured image via Imagen 3...');

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_IMAGE_KEY}`,
            {
                requests: [{ prompt, aspectRatio: "16:9" }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            }
        );

        const predictions = response.data.predictions;

        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
            const filename = `blog-${Date.now()}.png`;
            const filepath = path.join(BLOG_IMAGES_DIR, filename);
            const buffer = Buffer.from(predictions[0].bytesBase64Encoded, 'base64');
            fs.writeFileSync(filepath, buffer);
            console.log(`[Auto-Blog] Featured image saved: ${filename}`);
            return `/blog-images/${filename}`;
        }

        console.warn('[Auto-Blog] Imagen returned no image data');
        return null;
    } catch (error) {
        console.error('[Auto-Blog] Image generation failed:', error.response?.data?.error?.message || error.message);
        return null;
    }
}

/**
 * Main: Generate a full SEO-optimized blog post using Gemini AI
 */
async function generateAutoBlogPost() {
    console.log('[Auto-Blog] ========== STARTING AUTO BLOG GENERATION ==========');

    // 1. Pick a smart topic
    const topic = await pickSmartTopic();
    console.log(`[Auto-Blog] Selected topic: "${topic.theme}" (${topic.category})`);

    // 2. Gather website context for internal linking
    const { existingPosts, staticPages } = await getExistingContent();
    console.log(`[Auto-Blog] Found ${existingPosts.length} existing posts and ${staticPages.length} static pages for internal linking`);

    // 3. Build the mega-prompt
    const internalLinksContext = [
        ...staticPages.map(p => `- [${p.title}](${SITE_URL}${p.url}) — ${p.description}`),
        ...existingPosts.slice(0, 8).map(p => `- [${p.title}](${SITE_URL}${p.url})`),
    ].join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an EXPERT Indian SEO copywriter and content strategist for "Teer Club" (teer.club) — India's #1 Shillong Teer result, prediction, and dream interpretation platform.

TARGET KEYWORD THEME: "${topic.theme}"

EXISTING SITE CONTENT (use these for internal linking):
${internalLinksContext}

Write a HIGH-RANKING, Google Discover-approved blog post. Return ONLY valid JSON (no markdown backticks).

STRICT REQUIREMENTS:

1. "title": A CLICKBAIT title for Indian audience (50-60 chars). Use power words like "Secret", "Shocking", "Proven", "Ultimate", emoji optional. Examples: "🏹 Secret Teer Formula That Pro Players Use", "Shocking Teer Pattern Nobody Talks About"

2. "excerpt": A compelling 2-sentence meta description (150-160 chars) that creates curiosity and urgency. Include the focus keyword naturally.

3. "content": 1500-2000 word HTML blog article body. MUST include:
   - Proper heading hierarchy: <h2> for main sections, <h3> for subsections
   - <strong> tags for important keywords and phrases
   - <ul>/<ol> lists for tips, steps, and key points
   - At least 3-4 NATURAL internal links using <a href="..."> to the existing site content listed above
   - Engaging opening hook paragraph
   - Data-driven insights with specific numbers and statistics
   - FAQ section at the end with <h3> questions and <p> answers (at least 3 FAQs)
   - Call-to-action paragraphs linking to teer.club features
   - Use conversational Indian English tone — relatable, slightly informal, engaging
   - NO affiliate links, NO external links, ONLY internal links to teer.club pages
   - DO NOT wrap in <html>, <body>, or <div> root tags

4. "meta_title": SEO-optimized title tag (50-60 chars max), include primary keyword

5. "meta_description": Compelling meta description (150-160 chars), include keyword, create FOMO/curiosity

6. "focus_keyword": The exact primary keyword phrase (2-4 words) to target

7. "tags": Array of 5-7 relevant SEO keywords/phrases

8. "schema_markup": A valid JSON-LD Article schema object as a STRING with:
   - @type: "Article"
   - headline: the title
   - description: the meta description
   - author: { @type: "Organization", name: "Teer Club" }
   - publisher: { @type: "Organization", name: "Teer Club", url: "https://teer.club" }
   - datePublished: current ISO date
   - mainEntityOfPage: the blog URL

Format: Return ONLY valid JSON. No markdown code fences. No extra text.`;

    console.log('[Auto-Blog] Sending prompt to Gemini 2.5 Flash...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let articleData;
    try {
        articleData = JSON.parse(jsonStr);
    } catch (parseErr) {
        console.error('[Auto-Blog] Failed to parse Gemini response:', parseErr.message);
        console.error('[Auto-Blog] Raw response (first 500 chars):', jsonStr.substring(0, 500));
        throw new Error('Gemini returned invalid JSON. Please try again.');
    }

    // Validate required fields
    if (!articleData.title || !articleData.content) {
        throw new Error('Gemini response missing required fields (title or content)');
    }

    console.log(`[Auto-Blog] Article generated: "${articleData.title}"`);

    // 4. Generate featured image
    const featuredImage = await generateFeaturedImage(articleData.title, topic.theme);

    // 5. Prepare data for DB insert
    const slug = createSlug(articleData.title);
    const tags = Array.isArray(articleData.tags) ? articleData.tags.join(', ') : (articleData.tags || '');
    const schemaMarkup = typeof articleData.schema_markup === 'string'
        ? articleData.schema_markup
        : JSON.stringify(articleData.schema_markup || '');

    // 6. Insert into DB
    const insertQuery = `
        INSERT INTO posts (
            title, slug, category, excerpt, content, featured_image,
            is_published, meta_title, meta_description, focus_keyword,
            tags, schema_markup, is_ai_generated, generation_theme
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
    `;
    const values = [
        articleData.title,
        slug,
        topic.category,
        articleData.excerpt || articleData.meta_description || 'Read the latest teer insights on Teer Club.',
        articleData.content,
        featuredImage ? `${SITE_URL}${featuredImage}` : null,
        true, // is_published = auto-publish
        articleData.meta_title || articleData.title.substring(0, 60),
        articleData.meta_description || articleData.excerpt || '',
        articleData.focus_keyword || topic.theme,
        tags,
        schemaMarkup,
        true, // is_ai_generated
        topic.theme,
    ];

    const dbRes = await db.query(insertQuery, values);
    const newPost = dbRes.rows[0];
    console.log(`[Auto-Blog] POST PUBLISHED — ID: ${newPost.id}, Slug: ${newPost.slug}`);

    // 7. Ping Google Indexing API
    const postUrl = `${SITE_URL}/blog/${slug}`;
    try {
        await triggerGoogleIndex(postUrl, 'URL_UPDATED');
        console.log(`[Auto-Blog] Google Indexing API pinged for: ${postUrl}`);
    } catch (indexErr) {
        console.error('[Auto-Blog] Google indexing ping failed (non-blocking):', indexErr.message);
    }

    // Also ping the blog listing page
    triggerGoogleIndex(`${SITE_URL}/blog`, 'URL_UPDATED').catch(() => { });

    // 8. Regenerate sitemap
    try {
        await generateStaticSitemap();
        console.log('[Auto-Blog] Sitemap regenerated successfully');
    } catch (sitemapErr) {
        console.error('[Auto-Blog] Sitemap regeneration failed (non-blocking):', sitemapErr.message);
    }

    console.log('[Auto-Blog] ========== AUTO BLOG GENERATION COMPLETE ==========');

    return {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        category: newPost.category,
        excerpt: newPost.excerpt,
        featured_image: newPost.featured_image,
        meta_title: newPost.meta_title,
        meta_description: newPost.meta_description,
        focus_keyword: newPost.focus_keyword,
        tags: tags,
        url: postUrl,
        image_generated: !!featuredImage,
        google_indexed: true,
        sitemap_updated: true,
        created_at: newPost.created_at,
    };
}

module.exports = { generateAutoBlogPost };
