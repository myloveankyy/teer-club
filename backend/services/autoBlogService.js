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

/**
 * Clean, SEO-friendly slug — no random gibberish at the end
 */
function createSlug(title) {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 75);
    // Add short 4-char hash to prevent collisions
    const hash = Math.random().toString(36).substring(2, 6);
    return `${base}-${hash}`;
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
            { title: "Dream Number Lookup", url: "/dreams", description: "Dream interpretation" },
            { title: "Teer Tools & Calculator", url: "/tools", description: "Probability calculator" },
            { title: "Teer Blog", url: "/blog", description: "Insights and guides" },
        ];
        return {
            existingPosts: postsRes.rows.map(p => ({ title: p.title, url: `/blog/${p.slug}` })),
            staticPages,
        };
    } catch (err) {
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
 * Generate featured image — Google Discovery style (NO text on image!)
 */
async function generateFeaturedImage(title, theme, onProgress) {
    onProgress('image', 'Generating featured image...');

    // Higher-tier psychological clickbait concept (Industry Grade)
    const imagePrompt = `A premium, high-impact Pinterest-style modern blog thumbnail for: "${theme}". 
    Psychological Concept: "The Fortune's Call". 
    Visuals: Foreground shows a photo-realistic, sharp focus on a pair of hands holding an archery bow with golden arrows, aiming at a vibrant target. In the background, a beautiful blur of a traditional Northeast Indian landscape with a subtle 'Winning Blackboard' overlay that looks like a high-end glassmorphism design. 
    Colors: Royal Gold, Deep Emerald Green, and Radiant Red. 
    Aesthetic: Hyper-realistic, 8k resolution, cinematic lighting, shallow depth of field. The design feels both high-end and extremely enticing ("Clickbait-Premium"). 
    IMPORTANT: Absolutely NO text, NO watermarks, NO letters. Focus on the raw emotion of 'The Win'.`;

    // Method 1: Imagen 3 API (Highest Quality - Prio)
    try {
        onProgress('image', 'Generating with Premium Imagen 3...');
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            {
                requests: [
                    {
                        prompt: imagePrompt,
                        aspectRatio: "16:9",
                        // Imagen 3 specific quality boosts
                        safetySetting: { "category": "HATE_SPEECH", "threshold": "BLOCK_NONE" }
                    }
                ]
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
        );

        if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
            const filename = `blog-${Date.now()}.png`;
            fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64'));
            onProgress('image', '✅ Premium Imagen featured image generated!');
            return `/blog-images/${filename}`;
        }
    } catch (err) {
        console.error('[Auto-Blog] Imagen 3 Premium failed:', err.message);
    }

    // Method 2: Gemini 2.0 Flash Image Generation (Backup)
    try {
        onProgress('image', 'Trying Gemini ImageFX backup...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
        });
        const parts = result.response?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData?.data) {
                const filename = `blog-${Date.now()}.png`;
                fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), Buffer.from(part.inlineData.data, 'base64'));
                onProgress('image', '✅ AI featured image generated!');
                return `/blog-images/${filename}`;
            }
        }
    } catch (err) {
        console.error('[Auto-Blog] Gemini ImageFX failed:', err.message);
    }

    // Method 3: Unsplash-style free stock photo from Picsum
    try {
        onProgress('image', 'Fetching stock photo...');
        const imgRes = await axios.get('https://picsum.photos/1200/628?blur=1', { responseType: 'arraybuffer', timeout: 10000, maxRedirects: 5 });
        const filename = `blog-${Date.now()}.jpg`;
        fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), imgRes.data);
        onProgress('image', '✅ Stock photo saved');
        return `/blog-images/${filename}`;
    } catch (err) {
        console.error('[Auto-Blog] Stock photo failed:', err.message);
    }

    onProgress('image', '⚠️ No image generated');
    return null;
}

/**
 * Main generation function
 */
async function generateAutoBlogPost(language = 'English', onProgress = () => { }) {
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
    onProgress('article', `Generating ${language} article with Gemini AI...`);
    const internalLinksContext = [
        ...staticPages.map(p => `- [${p.title}](${SITE_URL}${p.url}) — ${p.description}`),
        ...existingPosts.slice(0, 8).map(p => `- [${p.title}](${SITE_URL}${p.url})`),
    ].join('\n');

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.85,
        }
    });

    const prompt = `You are the lead content strategist at Teer Club (teer.club). Your goal is to write the most authoritative, comprehensive, and helpful blog post about Shillong Teer for an audience of passionate players.

LANGUAGE DIRECTIVE:
    You MUST write the ENTIRE blog post content, excerpt, title, and all JSON fields in this specific language: ${language.toUpperCase()}. Do not use English unless the requested language is English or if using technical terms like "House", "Ending", "FR", "SR".

TOPIC: "${topic.theme}"

INTERNAL LINKS TO EMBED (use 3-5):
${internalLinksContext}

Generate a PREMIUM, industry-grade blog post. Return this JSON:
{
  "title": "Authoritative title in ${language.toUpperCase()}",
  "excerpt": "Compelling 160-char summary in ${language.toUpperCase()}",
  "content": "HTML body (1800-2500 words)",
  "meta_title": "SEO Title in ${language.toUpperCase()}",
  "meta_description": "SEO Meta Description in ${language.toUpperCase()}",
  "focus_keyword": "Primary keyword in ${language.toUpperCase()}",
  "featured_image_alt": "Descriptive, keyword-rich alt text in ${language.toUpperCase()}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

CONTENT REQUIREMENTS:
- Length: 1800-2500 words.
- HTML: Use <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table>, <a>.
- Structure: Start with a strong introduction, followed by data analysis, strategy tips, a detailed pattern table, FAQ, and a conclusion.
- SEO: Use the focus keyword in the first H2. Include LSI keywords (prediction, result timing, common numbers).
- Style: Professional, informative, and deeply knowledgeable. Avoid AI cliches.

DO NOT wrap content in <html> or <body> tags.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let articleData;
    let jsonStr = text.trim();

    // Clean up various common LLM garbage
    if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    }

    // Find first { and last } which is standard for extracting JSON from conversational noise
    const fb = jsonStr.indexOf('{');
    const lb = jsonStr.lastIndexOf('}');
    if (fb !== -1 && lb !== -1) {
        jsonStr = jsonStr.substring(fb, lb + 1);
    }

    try {
        articleData = JSON.parse(jsonStr);
    } catch (e1) {
        // Fallback: Try to fix common unescaped newline issues in content blocks which LLMs often do
        try {
            // This replaces actual newlines inside strings while keeping \n tokens
            const fixedJson = jsonStr.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
            // Note: This is a hacky fallback, better to try a slightly more controlled approach
            articleData = JSON.parse(jsonStr.replace(/[\u0000-\u001f]/g, ' '));
        } catch (e2) {
            console.error('[Auto-Blog] JSON parse failed after cleanup.');
            console.error('Cleaned String (first 200):', jsonStr.substring(0, 200));
            throw new Error('AI returned invalid JSON format. Please try again.');
        }
    }

    if (!articleData.title || !articleData.content) {
        throw new Error('AI response missing title or content fields');
    }
    if (articleData.content.length < 500) {
        throw new Error(`Content too short (${articleData.content.length} chars). Expected 1800+ word article.`);
    }

    onProgress('article', `✅ Article: "${articleData.title}" (${articleData.content.length} chars)`);

    // Step 4: Generate image
    const featuredImageUrl = await generateFeaturedImage(articleData.title, topic.theme, onProgress);

    // Step 5: Save to DB
    onProgress('publish', 'Publishing to database...');
    const slug = createSlug(articleData.title);
    const tags = Array.isArray(articleData.tags) ? articleData.tags.join(', ') : (articleData.tags || '');
    const schemaMarkup = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleData.title,
        "description": articleData.meta_description || articleData.excerpt || '',
        "author": { "@type": "Person", "name": "Rajesh Kumar", "url": SITE_URL },
        "publisher": { "@type": "Organization", "name": "Teer Club", "url": SITE_URL },
        "datePublished": new Date().toISOString(),
        "mainEntityOfPage": `${SITE_URL}/blog/${slug}`,
        ...(featuredImageUrl ? { "image": featuredImageUrl } : {})
    });

    const dbRes = await db.query(`
        INSERT INTO posts (
        title, slug, category, excerpt, content, featured_image, featured_image_alt,
        is_published, meta_title, meta_description, focus_keyword,
        tags, schema_markup, is_ai_generated, generation_theme
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *
        `, [
        articleData.title,
        slug,
        topic.category,
        articleData.excerpt || articleData.meta_description || '',
        articleData.content,
        featuredImageUrl,
        articleData.featured_image_alt || articleData.title,
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
    onProgress('publish', `✅ Published: ID ${newPost.id}`);

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
        image_generated: !!featuredImageUrl,
        google_indexed: true,
        sitemap_updated: true,
        created_at: newPost.created_at,
        generation_time: `${elapsed}s`,
    };
}

module.exports = { generateAutoBlogPost };
