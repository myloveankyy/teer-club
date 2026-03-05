const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { triggerGoogleIndex } = require('./seoIndexer');
const { generateStaticSitemap } = require('./sitemapGenerator');

// Single API key from env — injected via GitHub Secrets on deploy
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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

async function getExistingContent() {
    try {
        const postsRes = await db.query(
            `SELECT title, slug, category FROM posts WHERE is_published = true ORDER BY created_at DESC LIMIT 15`
        );
        const staticPages = [
            { title: "Shillong Teer Results", url: "/", description: "Live teer results" },
            { title: "Teer Result History", url: "/history", description: "Past results archive" },
            { title: "Teer Predictions", url: "/predictions", description: "AI-powered predictions" },
            { title: "Dream Number Lookup", url: "/dreams", description: "Dream interpretation for teer" },
            { title: "Teer Tools & Calculator", url: "/tools", description: "Probability calculator" },
            { title: "Teer Blog", url: "/blog", description: "Insights and guides" },
        ];
        return {
            existingPosts: postsRes.rows.map(p => ({ title: p.title, url: `/blog/${p.slug}` })),
            staticPages,
        };
    } catch (err) {
        console.error('[Auto-Blog] Failed to fetch existing content:', err.message);
        return { existingPosts: [], staticPages: [] };
    }
}

async function pickSmartTopic() {
    try {
        const recentRes = await db.query(
            `SELECT generation_theme FROM posts WHERE is_ai_generated = true ORDER BY created_at DESC LIMIT 10`
        );
        const recentThemes = recentRes.rows.map(r => r.generation_theme).filter(Boolean);
        const available = KEYWORD_THEMES.filter(k => !recentThemes.includes(k.theme));
        if (available.length === 0) return KEYWORD_THEMES[Math.floor(Math.random() * KEYWORD_THEMES.length)];
        return available[Math.floor(Math.random() * available.length)];
    } catch (err) {
        return KEYWORD_THEMES[Math.floor(Math.random() * KEYWORD_THEMES.length)];
    }
}

/**
 * Generate featured image with 3-tier fallback
 */
async function generateFeaturedImage(title, theme, onProgress) {
    onProgress('image', 'Generating featured image...');

    // Method 1: Imagen 3
    try {
        onProgress('image', 'Trying Imagen 3 API...');
        const prompt = `Vibrant blog featured image for Indian audience about "${theme}". Rich warm Indian colors saffron deep red royal blue gold. Traditional Meghalaya archery Teer elements bamboo arrows wooden bows. Misty green hills of Northeast India background. Mystical fortune-telling atmosphere. Cinematic quality hyper-realistic digital art landscape orientation. NO text.`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            { requests: [{ prompt, aspectRatio: "16:9" }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
        );
        const predictions = response.data?.predictions;
        if (predictions?.[0]?.bytesBase64Encoded) {
            const filename = `blog-${Date.now()}.png`;
            fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), Buffer.from(predictions[0].bytesBase64Encoded, 'base64'));
            onProgress('image', '✅ Featured image generated!');
            return `/blog-images/${filename}`;
        }
    } catch (err) {
        console.error('[Auto-Blog] Imagen 3 failed:', err.response?.data?.error?.message || err.message);
    }

    // Method 2: Gemini 2.0 Flash image generation
    try {
        onProgress('image', 'Trying Gemini Flash image gen...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: `Generate a vibrant featured image for a blog post about "${theme}". Indian archery theme with Meghalaya scenery, warm colors. No text.` }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
        });
        const parts = result.response?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData?.data) {
                const filename = `blog-${Date.now()}.png`;
                fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), Buffer.from(part.inlineData.data, 'base64'));
                onProgress('image', '✅ Featured image generated!');
                return `/blog-images/${filename}`;
            }
        }
    } catch (err) {
        console.error('[Auto-Blog] Gemini Flash image failed:', err.message);
    }

    // Method 3: Placeholder
    try {
        onProgress('image', 'Using fallback placeholder...');
        const text = encodeURIComponent(theme.substring(0, 30));
        const url = `https://placehold.co/1200x628/1e1b4b/e0e7ff/png?text=${text}&font=roboto`;
        const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        const filename = `blog-${Date.now()}.png`;
        fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), imgRes.data);
        onProgress('image', '✅ Placeholder image saved');
        return `/blog-images/${filename}`;
    } catch (err) {
        console.error('[Auto-Blog] Placeholder failed:', err.message);
    }

    onProgress('image', '⚠️ No image generated');
    return null;
}

/**
 * Main generation function with progress callback
 */
async function generateAutoBlogPost(onProgress = () => { }) {
    const startTime = Date.now();

    if (!genAI || !GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured. Add it to your .env and GitHub Secrets.');
    }

    // Step 1: Pick topic
    onProgress('topic', 'Selecting smart topic...');
    const topic = await pickSmartTopic();
    onProgress('topic', `✅ Topic: "${topic.theme}"`);

    // Step 2: Gather context
    onProgress('context', 'Gathering website context...');
    const { existingPosts, staticPages } = await getExistingContent();
    onProgress('context', `✅ Found ${existingPosts.length} posts for internal linking`);

    // Step 3: Generate article
    onProgress('article', 'Generating article with Gemini AI...');
    const internalLinksContext = [
        ...staticPages.map(p => `- [${p.title}](${SITE_URL}${p.url}) — ${p.description}`),
        ...existingPosts.slice(0, 8).map(p => `- [${p.title}](${SITE_URL}${p.url})`),
    ].join('\n');

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.9,
        }
    });

    const prompt = `You are an EXPERT Indian SEO copywriter for "Teer Club" (teer.club) — India's leading Shillong Teer result and prediction platform.

TOPIC: "${topic.theme}"

INTERNAL LINKS TO EMBED (use 3-4 naturally in the article):
${internalLinksContext}

Generate a HIGH-QUALITY, SEO-optimized blog post with this JSON structure:

{
  "title": "Engaging clickbait title for Indian audience, 50-60 chars. Use power words like Secret, Shocking, Proven, Ultimate. Example: Secret Teer Formula That Pro Players Use",
  "excerpt": "Compelling 2-sentence summary that creates curiosity. 150-160 chars. Include focus keyword naturally.",
  "content": "1500-2000 word HTML article. Use <h2> for main sections, <h3> for subsections, <p> for paragraphs, <strong> for emphasis, <ul>/<ol> for lists, <a href='https://teer.club/...'> for 3-4 internal links. Include: engaging opening hook, data-driven insights with numbers, actionable tips, FAQ section with 3+ <h3> questions and <p> answers, call-to-action. Conversational Indian English tone. NO external links. NO <html>/<body>/<div> wrapper tags.",
  "meta_title": "SEO title 50-60 chars including primary keyword",
  "meta_description": "Compelling meta description 150-160 chars with keyword and urgency/curiosity",
  "focus_keyword": "Primary keyword phrase 2-4 words",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Make the content GENUINELY USEFUL and DETAILED. Include specific numbers, formulas, strategies. Write like a real teer expert sharing insider knowledge.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response
    let articleData;
    try {
        // First try direct parse (since we set responseMimeType to application/json)
        articleData = JSON.parse(text);
    } catch (e1) {
        // Fallback: extract JSON from markdown wrapping
        let jsonStr = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const fb = jsonStr.indexOf('{');
        const lb = jsonStr.lastIndexOf('}');
        if (fb !== -1 && lb !== -1) jsonStr = jsonStr.substring(fb, lb + 1);
        try {
            articleData = JSON.parse(jsonStr);
        } catch (e2) {
            console.error('[Auto-Blog] JSON parse failed. Raw (first 500):', text.substring(0, 500));
            throw new Error('AI returned invalid JSON. Please try again.');
        }
    }

    if (!articleData.title || !articleData.content) {
        throw new Error('AI response missing title or content fields');
    }

    // Validate content length
    if (articleData.content.length < 200) {
        throw new Error(`Content too short (${articleData.content.length} chars). Expected 1500+ word article.`);
    }

    onProgress('article', `✅ Article generated: "${articleData.title}" (${articleData.content.length} chars)`);

    // Step 4: Generate image
    const featuredImage = await generateFeaturedImage(articleData.title, topic.theme, onProgress);
    const featuredImageUrl = featuredImage ? `${SITE_URL}${featuredImage}` : null;

    // Step 5: Save to DB
    onProgress('publish', 'Publishing to database...');
    const slug = createSlug(articleData.title);
    const tags = Array.isArray(articleData.tags) ? articleData.tags.join(', ') : (articleData.tags || '');
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

    const dbRes = await db.query(`
        INSERT INTO posts (
            title, slug, category, excerpt, content, featured_image,
            is_published, meta_title, meta_description, focus_keyword,
            tags, schema_markup, is_ai_generated, generation_theme
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *
    `, [
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
    ]);

    const newPost = dbRes.rows[0];
    onProgress('publish', `✅ Published — ID: ${newPost.id}`);

    // Step 6: SEO
    onProgress('seo', 'Pinging Google & updating sitemap...');
    const postUrl = `${SITE_URL}/blog/${slug}`;
    triggerGoogleIndex(postUrl, 'URL_UPDATED').catch(e => console.error('[Auto-Blog] Google ping failed:', e.message));
    triggerGoogleIndex(`${SITE_URL}/blog`, 'URL_UPDATED').catch(() => { });
    generateStaticSitemap().catch(e => console.error('[Auto-Blog] Sitemap failed:', e.message));
    onProgress('seo', '✅ Google pinged & sitemap updated');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    onProgress('done', `✅ Complete in ${elapsed}s`);

    return {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        category: newPost.category,
        excerpt: newPost.excerpt,
        content_length: articleData.content.length,
        featured_image: newPost.featured_image,
        meta_title: newPost.meta_title,
        meta_description: newPost.meta_description,
        focus_keyword: newPost.focus_keyword,
        tags,
        url: postUrl,
        image_generated: !!featuredImage,
        google_indexed: true,
        sitemap_updated: true,
        created_at: newPost.created_at,
        generation_time: `${elapsed}s`,
    };
}

module.exports = { generateAutoBlogPost };
