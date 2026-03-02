const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates common numbers using Gemini AI based on historical data
 * @param {string} game - 'Shillong', 'Khanapara', 'Juwai'
 */
async function generateCommonNumbersWithAI(game) {
    try {
        // 1. Fetch historical results for context (last 20 results)
        const historyRes = await db.query(
            `SELECT * FROM results ORDER BY date DESC LIMIT 20`
        );

        const historyData = historyRes.rows.map(r => ({
            date: r.date,
            r1: game === 'Shillong' ? r.round1 : (game === 'Khanapara' ? r.khanapara_r1 : r.juwai_r1),
            r2: game === 'Shillong' ? r.round2 : (game === 'Khanapara' ? r.khanapara_r2 : r.juwai_r2)
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a expert Teer (archery based lottery) analyst. 
            Based on the following historical results for ${game} Teer:
            ${JSON.stringify(historyData)}

            Predict the most probable "Common Numbers" for today.
            In Teer, we need:
            1. House (Starting digits, list 2-3)
            2. Ending (Ending digits, list 2-3)
            3. Direct Numbers (Full 2-digit numbers, list 4-6)

            Return ONLY a JSON object in this format:
            {
                "house": "digit1, digit2",
                "ending": "digit3, digit4",
                "direct_numbers": "num1, num2, num3, num4, num5, num6"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response if it contains markdown code blocks
        const cleanedText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error(`AI Generation Error for ${game}:`, error);
        // Fallback mock logic if AI fails or key is missing
        return {
            house: "1, 6",
            ending: "3, 8",
            direct_numbers: "13, 18, 63, 68, 11, 66"
        };
    }
}

module.exports = { generateCommonNumbersWithAI };
