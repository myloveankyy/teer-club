const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { triggerGoogleIndex } = require('./seoIndexer');
const { generateStaticSitemap } = require('./sitemapGenerator');

// Keys — same pattern used across the codebase
// Single API key from env — injected via GitHub Secrets on deploy
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
        const available = KEYWORD_THEMES.filter(k => !recentThemes.includes(k.theme));

        if (available.length === 0) {
            return KEYWORD_THEMES[Math.floor(Math.random() * KEYWORD_THEMES.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    } catch (err) {
        // If the column doesn't exist yet, just pick random
        console.warn('[Auto-Blog] pickSmartTopic fallback:', err.message);
        return KEYWORD_THEMES[Math.floor(Math.random() * KEYWORD_THEMES.length)];
    }
}

/**
 * Generate featured image using Gemini Imagen 3
 * Returns the path on success, null on failure (non-blocking)
 */
async function generateFeaturedImage(title, theme) {
    console.log('[Auto-Blog] === IMAGE GENERATION START ===');

    // Method 1: Try Imagen 3 API
    try {
        const prompt = `A vibrant, eye-catching blog featured image for Indian audience about "${theme}". 
Rich warm Indian colors, saffron, deep red, royal blue, gold.
Traditional Meghalaya archery Teer elements, bamboo arrows, wooden bows.
Misty green hills of Northeast India background.
Mystical fortune-telling atmosphere.
Cinematic quality, hyper-realistic digital art, landscape orientation.
NO text in any script except English.`;

        console.log('[Auto-Blog] Trying Imagen 3 API...');

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            { requests: [{ prompt, aspectRatio: "16:9" }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
        );

        const predictions = response.data?.predictions;
        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
            const filename = `blog-${Date.now()}.png`;
            const filepath = path.join(BLOG_IMAGES_DIR, filename);
            fs.writeFileSync(filepath, Buffer.from(predictions[0].bytesBase64Encoded, 'base64'));
            console.log(`[Auto-Blog] ✅ Imagen 3 image saved: ${filename}`);
            return `/blog-images/${filename}`;
        }
        console.warn('[Auto-Blog] Imagen 3 returned empty predictions');
    } catch (err) {
        console.error('[Auto-Blog] ❌ Imagen 3 failed:', err.response?.data?.error?.message || err.message);
    }

    // Method 2: Try Gemini 2.0 Flash image generation
    try {
        console.log('[Auto-Blog] Trying Gemini 2.0 Flash image generation...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `Generate a vibrant featured image for a blog post about "${theme}". Indian archery theme with Meghalaya scenery, warm colors.`
                }]
            }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
        });

        const response = result.response;
        if (response.candidates && response.candidates[0]) {
            const parts = response.candidates[0].content?.parts || [];
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const filename = `blog-${Date.now()}.png`;
                    const filepath = path.join(BLOG_IMAGES_DIR, filename);
                    fs.writeFileSync(filepath, Buffer.from(part.inlineData.data, 'base64'));
                    console.log(`[Auto-Blog] ✅ Gemini Flash image saved: ${filename}`);
                    return `/blog-images/${filename}`;
                }
            }
        }
        console.warn('[Auto-Blog] Gemini Flash returned no image data');
    } catch (err) {
        console.error('[Auto-Blog] ❌ Gemini Flash image failed:', err.message);
    }

    // Method 3: Fallback — Use a high-quality placeholder
    try {
        console.log('[Auto-Blog] Using fallback placeholder image...');
        const encodedTitle = encodeURIComponent(theme.substring(0, 40));
        const placeholderUrl = `https://placehold.co/1200x628/1e293b/f8fafc/png?text=${encodedTitle}&font=roboto`;

        const imgRes = await axios.get(placeholderUrl, { responseType: 'arraybuffer', timeout: 10000 });
        const filename = `blog-${Date.now()}.png`;
        const filepath = path.join(BLOG_IMAGES_DIR, filename);
        fs.writeFileSync(filepath, imgRes.data);
        console.log(`[Auto-Blog] ✅ Fallback image saved: ${filename}`);
        return `/blog-images/${filename}`;
    } catch (err) {
        console.error('[Auto-Blog] ❌ Fallback image also failed:', err.message);
    }

    console.warn('[Auto-Blog] === ALL IMAGE METHODS FAILED — proceeding without image ===');
    return null;
}

/**
 * Main: Generate a full SEO-optimized blog post using Gemini AI
 */
async function generateAutoBlogPost() {
    console.log('[Auto-Blog] ========== STARTING AUTO BLOG GENERATION ==========');
    const startTime = Date.now();

    // 1. Pick a smart topic
    const topic = await pickSmartTopic();
    console.log(`[Auto-Blog] Selected topic: "${topic.theme}" (${topic.category})`);

    // 2. Gather website context for internal linking
    const { existingPosts, staticPages } = await getExistingContent();
    console.log(`[Auto-Blog] Context: ${existingPosts.length} posts, ${staticPages.length} static pages`);

    // 3. Build the mega-prompt
    const internalLinksContext = [
        ...staticPages.map(p => `- [${p.title}](${SITE_URL}${p.url}) — ${p.description}`),
        ...existingPosts.slice(0, 8).map(p => `- [${p.title}](${SITE_URL}${p.url})`),
    ].join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an EXPERT Indian SEO copywriter for "Teer Club" (teer.club) — India's #1 Shillong Teer result and prediction platform.

TARGET KEYWORD: "${topic.theme}"

INTERNAL LINKS (embed 3-4 naturally in the article):
${internalLinksContext}

Write a blog post. Return ONLY valid JSON with these exact keys:

{
  "title": "Clickbait title for Indian audience, 50-60 chars, use power words",
  "excerpt": "2-sentence meta description, 150-160 chars, creates curiosity",
  "content": "1500-2000 word HTML article body with <h2>, <h3>, <strong>, <ul>/<ol>, 3-4 internal <a href> links, FAQ section with 3 questions. Conversational Indian English. NO <html>/<body>/<div> root tags.",
  "meta_title": "SEO title tag 50-60 chars with primary keyword",
  "meta_description": "Meta description 150-160 chars with keyword and FOMO",
  "focus_keyword": "Primary keyword 2-4 words",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

CRITICAL: Return ONLY raw JSON. No markdown backticks. No explanation.`;

    console.log('[Auto-Blog] Sending to Gemini 2.5 Flash...');
    let articleData;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Aggressive JSON extraction
        let jsonStr = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        // If it starts with non-JSON text, try to find the JSON object
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        articleData = JSON.parse(jsonStr);
        console.log(`[Auto-Blog] ✅ Article parsed: "${articleData.title}"`);
    } catch (parseErr) {
        console.error('[Auto-Blog] ❌ Gemini response parse failed:', parseErr.message);
        throw new Error('AI returned invalid response. Please try again.');
    }

    if (!articleData.title || !articleData.content) {
        throw new Error('AI response missing title or content');
    }

    // 4. Generate featured image (non-blocking — post publishes even if image fails)
    console.log('[Auto-Blog] Starting image generation...');
    let featuredImage = null;
    try {
        featuredImage = await generateFeaturedImage(articleData.title, topic.theme);
    } catch (imgErr) {
        console.error('[Auto-Blog] Image generation threw:', imgErr.message);
    }

    // 5. Build featured image URL
    let featuredImageUrl = null;
    if (featuredImage) {
        featuredImageUrl = `${SITE_URL}${featuredImage}`;
    }

    // 6. Prepare slug and data
    const slug = createSlug(articleData.title);
    const tags = Array.isArray(articleData.tags) ? articleData.tags.join(', ') : (articleData.tags || '');

    // Build schema markup
    const schemaMarkup = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleData.title,
        "description": articleData.meta_description || articleData.excerpt || '',
        "author": { "@type": "Organization", "name": "Teer Club" },
        "publisher": { "@type": "Organization", "name": "Teer Club", "url": SITE_URL },
        "datePublished": new Date().toISOString(),
        "mainEntityOfPage": `${SITE_URL}/blog/${slug}`,
        ...(featuredImageUrl ? { "image": featuredImageUrl } : {})
    });

    // 7. Insert into DB
    console.log('[Auto-Blog] Inserting into database...');
    let newPost;
    try {
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
            articleData.excerpt || articleData.meta_description || 'Read the latest teer insights.',
            articleData.content,
            featuredImageUrl,
            true,
            articleData.meta_title || articleData.title.substring(0, 60),
            articleData.meta_description || articleData.excerpt || '',
            articleData.focus_keyword || topic.theme,
            tags,
            schemaMarkup,
            true,
            topic.theme,
        ];

        const dbRes = await db.query(insertQuery, values);
        newPost = dbRes.rows[0];
        console.log(`[Auto-Blog] ✅ Published — ID: ${newPost.id}, Slug: ${slug}`);
    } catch (dbErr) {
        console.error('[Auto-Blog] ❌ DB insert failed:', dbErr.message);
        throw new Error(`Database error: ${dbErr.message}`);
    }

    // 8. Google Indexing (fire-and-forget, never blocks)
    const postUrl = `${SITE_URL}/blog/${slug}`;
    triggerGoogleIndex(postUrl, 'URL_UPDATED')
        .then(() => console.log(`[Auto-Blog] ✅ Google pinged: ${postUrl}`))
        .catch(e => console.error('[Auto-Blog] Google ping failed:', e.message));

    triggerGoogleIndex(`${SITE_URL}/blog`, 'URL_UPDATED').catch(() => { });

    // 9. Sitemap regeneration (fire-and-forget)
    generateStaticSitemap()
        .then(() => console.log('[Auto-Blog] ✅ Sitemap regenerated'))
        .catch(e => console.error('[Auto-Blog] Sitemap regen failed:', e.message));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Auto-Blog] ========== COMPLETE in ${elapsed}s ==========`);

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
        generation_time: `${elapsed}s`,
    };
}

module.exports = { generateAutoBlogPost };
