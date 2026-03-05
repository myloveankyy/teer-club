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

    // Updated for authentic "human-made" Photoshop YouTube Thumbnail Indian lottery style
    const imagePrompt = `A highly realistic, human-made style YouTube thumbnail for the topic: "${theme}". Visual composition: Photo-realistic dark green chalkboard on the left with REALISTIC handwritten chalk numbers (like 24 or 55) circled in thick white chalk. Thick bright yellow graphical arrows pointing right. On the right side, bright neon-pink and neon-red rectangular 2D boxes containing the exact text "Daily Success" and "HIT" in bold white impact font, along with numbers "14" and "25" in bold red. The design MUST look exactly like an authentic, highly clickable Photoshop edit made by an Indian YouTuber. Absolutely NO smooth 3D render look, NO AI-generated digital art feeling. Gritty, high-contrast, flat layout, hyper-vibrant neon colors (red, yellow, blue, white). Use real-world textures to make it look 100% human-designed and clickbaity.`;

    // Method 1: Gemini 2.0 Flash Image Generation (CONFIRMED WORKING)
    try {
        onProgress('image', 'Generating with Gemini AI...');
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

    // Method 2: Imagen 3 API (backup)
    try {
        onProgress('image', 'Trying Imagen 3 backup...');
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            { requests: [{ prompt: imagePrompt, aspectRatio: "16:9" }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
        );
        if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
            const filename = `blog-${Date.now()}.png`;
            fs.writeFileSync(path.join(BLOG_IMAGES_DIR, filename), Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64'));
            onProgress('image', '✅ Featured image generated!');
            return `/blog-images/${filename}`;
        }
    } catch (err) {
        console.error('[Auto-Blog] Imagen 3 failed:', err.response?.data?.error?.message || err.message);
    }

    // Method 3: Unsplash-style free stock photo from Picsum
    try {
        onProgress('image', 'Fetching stock photo...');
        const imgRes = await axios.get('https://picsum.photos/1200/628?blur=2', { responseType: 'arraybuffer', timeout: 10000, maxRedirects: 5 });
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

    const prompt = `You are Rajesh, the senior editor at Teer Club(teer.club) — India's most trusted Shillong Teer result platform. You have 12+ years of experience with the teer lottery system. You write with authority, personal anecdotes, insider knowledge, and genuine passion for the game. Your readers are regular teer players from Northeast India and beyond.

LANGUAGE DIRECTIVE:
        You MUST write the ENTIRE blog post content, excerpt, title, and all JSON fields in this specific language: ${language.toUpperCase()}.Do not use English unless the requested language is English or if using technical teer terms(like "House", "Ending", "F/R", "S/R").If the language is "Hinglish", mix Hindi terms written in English letters.

            TOPIC: "${topic.theme}"

INTERNAL LINKS TO NATURALLY EMBED(use 3 - 5 in the article):
${internalLinksContext}

Generate a PREMIUM, human - sounding blog post.Return this JSON:

    {
        "title": "Engaging title 50-60 chars in ${language.toUpperCase()}. NOT clickbaity or AI-sounding. Example: 'Why Most Teer Players Get House-Ending Wrong (And How to Fix It)'",
            "excerpt": "2 sentences, 150-160 chars in ${language.toUpperCase()}. Written like a real human teaser. Include focus keyword.",
                "content": "HTML article body (details below)",
                    "meta_title": "SEO title 50-60 chars with primary keyword in ${language.toUpperCase()}",
                        "meta_description": "Meta description 150-160 chars with urgency and keyword in ${language.toUpperCase()}",
                            "focus_keyword": "2-4 word primary keyword in ${language.toUpperCase()}",
                                "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }

CONTENT REQUIREMENTS(this is critical):
    - 1800 - 2500 words of well - structured HTML inside the "content" field
        - MUST be written in ${language.toUpperCase()}
    - Use PROPER HTML tags: <h2> for 4-6 main sections, <h3> for subsections, <p> for paragraphs.
    - VERY IMPORTANT FORMATTING: Give the article lots of "breathing room" and "gapping". Write extremely short, punchy paragraphs (2-3 sentences max). This looks more like an industry-grade expert blog.
        - Use <strong> for key terms, <em> for emphasis
            - Use <ul>/<ol> for lists with <li> items
                - Include <blockquote> for expert tips or important callouts
                    - Include a VERY WELL FORMATTED <table> with data (result patterns, number frequencies). Ensure it looks clean with readable rows.
                        - Include 3-5 internal <a href="https://teer.club/..."> links naturally within sentences
                            - End with a FAQ section: 3 questions using <h3> and answers in <p>
                                - Finish with a CTA paragraph linking to teer.club features

    WRITING STYLE (critical — this must NOT feel AI-generated):
    - Write in FIRST PERSON as Rajesh from Teer Club team
    - Use phrases fitting the language ${language.toUpperCase()} (e.g. if Hindi, use Hindi slang, if Hinglish use "yaar", "bhai", "the thing is")
    - Reference specific numbers, dates, percentages. Example: "In February 2026, the number 47 appeared as house ending 8 times across Shillong rounds"
    - Share personal stories: "Last month, one of our Teer Club users messaged me..."
    - NO generic AI phrases like "In the realm of", "Furthermore", "It's important to note", "In conclusion"
    - Make it feel like reading advice from a knowledgeable friend, not a textbook

    DO NOT wrap content in <html>, <body>, or <div> tags. Start directly with an <h2> or <p>.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let articleData;
    try {
        articleData = JSON.parse(text);
    } catch (e1) {
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
        title, slug, category, excerpt, content, featured_image,
        is_published, meta_title, meta_description, focus_keyword,
        tags, schema_markup, is_ai_generated, generation_theme
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *
        `, [
        articleData.title,
        slug,
        topic.category,
        articleData.excerpt || articleData.meta_description || '',
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
