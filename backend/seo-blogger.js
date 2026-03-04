const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');

// Initialize Gemini
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is missing. SEO Auto-Blogger will be disabled.");
} else {
    genAI = new GoogleGenerativeAI(apiKey);
}

// High-volume keywords to rotate through for maximum ranking
const keywordThemes = [
    "Shillong Teer Dream Meanings",
    "How to Calculate Teer Common Number",
    "Teer Result Today Formula",
    "Khanapara Teer Target Number Strategy",
    "Juwai Teer Previous Result Analysis",
    "Mathematics of Shillong Teer Lottery",
    "Secret Teer House Ending Formula",
    "Shillong Teer Night Result Predictions"
];

// Helper to slugify titles
function createSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function generateSeoArticle() {
    if (!genAI) {
        console.warn("[SEO-Blogger] Aborted: Gemini API Key is missing.");
        return;
    }
    try {
        console.log(`[SEO-Blogger] Starting article generation at ${new Date().toISOString()}`);

        // Pick a random keyword theme
        const theme = keywordThemes[Math.floor(Math.random() * keywordThemes.length)];
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are an expert SEO copywriter and data analyst for the "Shillong Teer" lottery.
        Write a highly engaging, 1,000 to 1,500 word blog article targeting the keyword theme: "${theme}".

        Requirements:
        1. "title": A catchy, click-bait SEO title (max 60 chars).
        2. "excerpt": A compelling 2-sentence meta description.
        3. "content": The full HTML body of the article. Use <h2> and <h3> tags for structure, bullet points, and <strong> tags for emphasis. Do NOT wrap it in a root <div> or <html>. Just pure HTML content.
        4. "tags": An array of 3-5 relevant SEO keywords.

        Format: Return ONLY valid JSON block. No markdown backticks outside of what's strictly necessary for JSON.
        `;

        console.log(`[SEO-Blogger] Requesting Gemini generation for theme: ${theme}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```html/g, '').replace(/```/g, '').trim();
        const articleData = JSON.parse(jsonStr);

        if (!articleData.title || !articleData.content) {
            throw new Error("Invalid format from Gemini");
        }

        const slug = createSlug(articleData.title + '-' + Date.now().toString().slice(-4));
        const tagsString = Array.isArray(articleData.tags) ? articleData.tags.join(',') : '';

        // Insert into Database
        const query = `
            INSERT INTO blogs (slug, title, excerpt, content, tags, author, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'Teer AI Guru', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `;
        const values = [
            slug,
            articleData.title,
            articleData.excerpt || 'Read the latest strategy guide.',
            articleData.content,
            tagsString
        ];
        const dbRes = await db.query(query, values);
        console.log(`[SEO-Blogger] Successfully published new article: "${articleData.title}" (ID: ${dbRes.rows[0].id})`);
        return dbRes.rows[0].id;

    } catch (error) {
        console.error("[SEO-Blogger] Fatal Error:", error);
        throw error;
    }
}

// If run directly from cron job
if (require.main === module) {
    console.log("[SEO-Blogger] Script initiated manually or via cron.");
    generateSeoArticle().then(() => {
        console.log("[SEO-Blogger] Run complete.");
        process.exit(0);
    }).catch(err => {
        console.error("[SEO-Blogger] Run failed.");
        process.exit(1);
    });
}

module.exports = { generateSeoArticle };
