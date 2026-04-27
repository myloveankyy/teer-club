
const cheerio = require('cheerio');
const fs = require('fs');

function cleanHtmlForAI(html) {
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, nav, header, footer, aside, .ad, .advertisement, .sidebar, .nav, .menu, .comments, .cookie, [aria-hidden='true']").remove();
    $("tr, p, div, li, br, h1, h2, h3, h4, h5, h6").append("\n");
    $("td, th").append(" | ");
    let text = $("body").text() || "";
    text = text.replace(/[ \t]+/g, " ");
    text = text.replace(/\n\s*\n/g, "\n");
    return text.trim();
}

function regexExtract(text) {
    const results = [];
    const DATE_PATTERNS = [/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/g];

    for (const pattern of DATE_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const dateStr = match[0];
            const window = text.substring(match.index, match.index + 300);

            const nums = [];
            const tempPattern = /\b(\d{2})\b/g;
            let nMatch;
            while ((nMatch = tempPattern.exec(window)) !== null) {
                if (window.substring(Math.max(0, nMatch.index - 1), nMatch.index) === ":" || window.substring(nMatch.index + 2, nMatch.index + 3) === ":") continue;
                if (match[0].includes(nMatch[1])) continue;
                nums.push(nMatch[1]);
            }
            if (nums.length > 0) results.push({ date: dateStr, r1: nums[0], r2: nums[1], nums });
        }
    }
    return results;
}

const html = fs.readFileSync('shillong_ground_dump.html', 'utf8');
const cleaned = cleanHtmlForAI(html);
console.log('--- CLEANED ---');
console.log(cleaned.substring(0, 500));
console.log('--- RESULTS ---');
console.log(JSON.stringify(regexExtract(cleaned), null, 2));
