
// Logic copied from updated regexExtractor.ts
const DATE_PATTERNS = [
    /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/g,
    /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/g,
];

function regexExtract(text) {
    const results = [];
    const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0);

    for (const line of lines) {
        let dateStr = null;
        for (const pattern of DATE_PATTERNS) {
            pattern.lastIndex = 0;
            const match = pattern.exec(line);
            if (match) {
                dateStr = match[0];
                break;
            }
        }
        if (!dateStr) continue;

        const twoDigitNumbers = [];
        let numMatch;
        const tempPattern = /\b(\d{2})\b/g;

        while ((numMatch = tempPattern.exec(line)) !== null) {
            const num = parseInt(numMatch[1], 10);
            if (num >= 0 && num <= 99) {
                const pos = numMatch.index;
                const before = line.substring(Math.max(0, pos - 1), pos);
                const after = line.substring(pos + 2, pos + 3);

                // Filter out dates and times
                if (/[-/.]/.test(before) || /[-/.]/.test(after)) continue;
                if (before === ":" || after === ":") continue;

                twoDigitNumbers.push(numMatch[1]);
            }
        }
        if (twoDigitNumbers.length === 0) continue;
        results.push({ date: dateStr, r1: twoDigitNumbers[0], r2: twoDigitNumbers[1] });
    }
    return results;
}

const text = `Bhutan Teer Result (25-04-2026) F/R (04:15(PM) S/R (05:15(PM) 43 74`;
console.log(JSON.stringify(regexExtract(text), null, 2));
