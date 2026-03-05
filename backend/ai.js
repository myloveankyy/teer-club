const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with hardcoded user key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function analyzeDream(dreamText) {
    if (!genAI) {
        return {
            interpretation: "AI Analysis unavailable (Missing API Key). Showing generic result.",
            luckyNumbers: ["00", "11", "99"],
            symbolism: "General"
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a mystical dream interpreter for the Teer lottery game. 
        Analyze this dream: "${dreamText}".
        
        Provide a JSON response with:
        1. "interpretation": A short, mystical meaning (max 2 sentences).
        2. "symbolism": The core symbol (e.g., "Water", "Fire").
        3. "luckyNumbers": An array of 3 two-digit numbers (00-99) associated with this dream.
        
        Format: JSON only. No markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Gemini AI Error:", error);
        return {
            interpretation: "The mists of time obscure this dream. Try again later.",
            luckyNumbers: ["--", "--", "--"],
            symbolism: "Unknown"
        };
    }
}

module.exports = { analyzeDream };
